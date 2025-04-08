import re,json
import pandas as pd
from utils.settings import *
from utils.utils import get_diff,get_raw_data,get_intel, get_slack_message, get_error_message
from sqlalchemy import create_engine
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.types import VARCHAR, TEXT, TIMESTAMP, JSON
# from airflow import AirflowException
from utils.config import db_params

sql_engine = create_engine('postgresql://{user}:{password}@{host}:{port}/{dbname}'.format(**db_params))
class Load_ICS_Standards:
    def __init__(self):
        self.rdbms_table = ''
        self.job_name = "ISO - ICS Standards"
        self._pg_hook = ''#PostgresHook(rdbms_conn_id)
        self.cat_tag = ICS_CAT_TAG
        self.ics_tag = ICS_FAC_TAG
        self.stand_tag = ICS_ST_TAG
        self.intel_records = []
        self.run_time = datetime.now()
        self.slack_message = ''
        self.catalog_table = 'tbl_iso_hct_catalog'
        self.ics_table = 'tbl_ics'
        self.standards_table = 'tbl_iso_standards'
        self.regulatory_updates_table = 'regulatory_updates'
        self.first_load = False
        self.filtered_catalog_df = pd.DataFrame()
        self.filtered_ics_df = pd.DataFrame()
        self.filtered_standards_df = pd.DataFrame()


    def get_existing_data(self):
        cat_df = ics_df = std_df = pd.DataFrame()
        print('Fetching results from the database...')
        try:
            # sql_engine = self.pg_hook.get_sqlalchemy_engine()
            con = sql_engine.connect()
            cat_insrt_qry = """select * from tbl_iso_hct_catalog where updated_on =  (select max(updated_on) from tbl_iso_hct_catalog)"""
            ics_qry = """select * from tbl_ics where updated_on = (select max(updated_on) from tbl_ics) """
            std_qry = """ select * from tbl_iso_standards where updated_on = (select max(updated_on) from tbl_iso_standards) """
            cat_df = pd.read_sql_query(text(cat_insrt_qry), con=con)
            ics_df = pd.read_sql_query(text(ics_qry),con=con)
            std_df = pd.read_sql_query(text(std_qry),con=con)
            con.close()
        except Exception as e:
            print("Error while fetching the existing records :: "+str(e))
        return cat_df,ics_df,std_df


    def load_to_rdbms(self):
        self.filtered_catalog_df['updated_on'] = self.filtered_ics_df['updated_on'] = self.filtered_standards_df['updated_on']= datetime.now()
        try:
            # sql_engine = self.pg_hook.get_sqlalchemy_engine()
            con = sql_engine.connect()
            print(self.filtered_standards_df.shape)
            self.filtered_catalog_df.to_sql(self.catalog_table, sql_engine, index=False, if_exists='append', method='multi', chunksize=500)
            print("Data loaded into :: " + self.catalog_table)
            self.filtered_ics_df.to_sql(self.ics_table, sql_engine, index=False, if_exists='append', method='multi',chunksize=500)
            print("Data loaded into :: " + self.ics_table)
            self.filtered_standards_df.to_sql(self.standards_table, sql_engine, index=False, if_exists='append', method='multi',chunksize=500)

            print("Data loaded into :: " + self.standards_table)
            con.close()
        except Exception as e:
            print("Error loading data into table : "+str(e))
        return True



    def get_metadata(self,soup_obj,load_type):
        res = []
        data_tables = soup_obj.find_all('table')
        for table in data_tables:
            for row in table.find_all('tr'):
                payload = {}
                sections = row.find_all('td')
                if len(sections) > 0:
                    for header in sections:
                        if load_type == 1:  # for publications
                            try:
                                if header.get('data-title') == 'ICS':
                                    if header.find('a') is not None:
                                        payload['url'] = header.find('a').get('href')
                                        payload["title"] = header.find('a').text
                                    else:
                                        payload['url'] = None
                                        payload["title"] = header.get_text().replace('\n', '').strip()
                                elif header.get('data-title') == 'Field':
                                    payload['description'] = header.text.split('\n')[1].strip()
                            except Exception as e:
                                print("Error while getting table Details :: "+str(e))
                        elif load_type == 2:  # for standards
                            try:
                                if header.get('data-title') == 'Standard and/or project':
                                    a_tag = header.find('a')
                                    payload['title'] = a_tag.find('span', class_='entry-name').text.strip()
                                    payload['url'] = a_tag.get('href')
                                    # Description is in the next div inside the container
                                    description_div = header.find('div', class_='entry-description')
                                    if description_div:
                                        payload['description'] = description_div.text.strip()
                                if header.get('data-title') == 'Stage':
                                   payload['stage'] = header.find('a').text
                            except Exception as e:
                                print("Error while getting standards Details :: {e}")
                    if len(payload) > 0:
                        res.append(payload)
        return res

    # If anything modified in the standards page, please fix in this method
    def get_standard_details(self,soup_obj):
        section_id = 'product-details'  # Replace with the ID of the section you want to scrape
        item_prop = 'description'       # replace item_prop name to extract standard details
        ret = None
        try:
            section = soup_obj.find('section', id=section_id)
            desc = section.find_all(attrs={"itemprop": item_prop})
            stat = section.find('ul',class_='refine')
            ret = {}
            # to extract ABSTRACT for the standard
            if desc:
                val = ''
                for p in desc:
                    val += re.sub(r'\n+', '\n', p.get_text())
                ret['abstract'] = val.strip()
            else:
                ret['abstract'] = None
            doc_url_tag = section.select_one('figcaption a')
            ret['preview_doc'] = doc_url_tag['href'].strip() if doc_url_tag and doc_url_tag.has_attr('href') else None
            if stat:
                for li in stat.find_all("li", recursive=False):
                    divs = li.find_all("div", recursive=False)

                    for div in divs:
                        label_tag = div.find("div", class_="entry-label")
                        if label_tag:
                            # Get label text and clean it
                            key = label_tag.get_text(strip=True)
                            key = re.sub(r'\xa0|:$', '', key).replace(" ","_")

                            # Remove the label from the div to get only the value content
                            label_tag.decompose()
                            value = div.get_text(separator=' ', strip=True)
                            value = value.replace(":", "").strip()

                            # Handle multiple values in child <a> tags (like ICS)
                            links = div.find_all("a")
                            if links:
                                values = [a.get_text(strip=True) for a in links]
                                value = "|".join(values)

                            ret[key] = value

        except Exception as e:
            print("Error while extracting standard details :: "+str(e))
        return ret

    def get_fresh_data(self): 
        ret = []
        # extracting iso standards
        soup = get_raw_data(url=(iso_base_url+iso_hct_suffix))
        stand_metadata = self.get_metadata(soup_obj=soup,load_type=1)
        standards_df = pd.DataFrame(stand_metadata)
        # extracting list of publications
        for idx,row in standards_df.iterrows():
            res = {}
            res['ics_title'] = row['title']
            res['ics_description'] = row['description']
            ics_url = row['url']
            if ics_url is not None:
                soup = get_raw_data(url=(iso_base_url + ics_url[1:]))
                metadata = self.get_metadata(soup_obj=soup, load_type=1)
                # Extracting standards in each publication
                if len(metadata)>0:
                    for facility in metadata:
                        res['facility_title'] = facility['title']
                        res['facility_description'] = facility['description']
                        if facility['url'] is not None:
                            tables = get_raw_data(iso_base_url + facility['url'][1:])
                            standards = self.get_metadata(soup_obj=tables, load_type=2)
                            for stand in standards:
                                print("Extracting data for :: " + facility['title'] + "->" + stand['title'])
                                res['standard_title'] = stand['title']
                                res['standard_description'] = stand['description']
                                res['standard_stage'] = stand['stage']
                                res['standard_url'] = iso_base_url + stand['url'][1:]
                                soup = get_raw_data(url=(iso_base_url + stand['url'][1:]))
                                res['standard_details'] = self.get_standard_details(soup_obj=soup)
                                ret.append(res.copy())
                        else:
                            print("No URL provided for :: " + facility['title'])
                else:
                    print("No Facilities found for :: "+res['ics_title'])
            else:
                print("No URL provided for :: "+res['ics_title'])
        ics_df = pd.json_normalize(ret)
        return standards_df,ics_df


    def prepare_data(self):
        fresh_catalog_df,fresh_ics_df = self.get_fresh_data()
        existing_catalog_df,existing_ics_df,existing_standards_df = self.get_existing_data()
        #Load Catalog table
        if existing_catalog_df.shape[0]<1 and fresh_catalog_df.shape[0]>0:
            print("Fresh Load to table :: "+self.catalog_table)
            df = fresh_catalog_df[['title','description']].drop_duplicates()
            df['is_deleted'] = False
            self.filtered_catalog_df = df
        elif existing_catalog_df.shape[0]>0 and fresh_catalog_df.shape[0]>0:
            print("Data existed in catalog table")
            old_db = existing_catalog_df.query("is_deleted == False").iloc[:,:-2]
            new_db = fresh_catalog_df[['title','description']].drop_duplicates()
            added,deleted,before_updated,after_updated,existing=get_diff(p_key[self.catalog_table],old_db,new_db)
            print("+++++++++++ new_refs     : "+str(added.shape[0]))
            print("+++++++++++ deleted_refs : " + str(deleted.shape[0]))
            print("+++++++++++ updated_refs : " + str(after_updated.shape[0]))
            print("+++++++++++ NC_refs      : " + str(existing.shape[0]))
            added['is_deleted'] = after_updated['is_deleted'] = existing['is_deleted'] = False
            before_updated['is_deleted'] = deleted['is_deleted'] = True
            if added.shape[0] > 0 or deleted.shape[0] > 0 or after_updated.shape[0] > 0:
                print("Data Modified for catalog")
                new_intel_refs = []
                removed_intel_refs = []
                updated_intel_refs = []
                if added.shape[0]>0:
                    new_intel_refs = added[p_key[self.catalog_table]].apply("-".join, axis=1).tolist()
                if deleted.shape[0]>0:
                    removed_intel_refs = deleted[p_key[self.catalog_table]].apply("-".join, axis=1).tolist()
                if after_updated.shape[0]>0:
                    updated_intel_refs = after_updated[p_key[self.catalog_table]].apply("-".join, axis=1).tolist()
                self.intel_records += get_intel(new_refs=new_intel_refs,removed_refs=removed_intel_refs,changed_refs=updated_intel_refs,run_time=datetime.now(),identifier=self.cat_tag)
                if len(self.intel_records) > 0:
                    self.slack_message += get_slack_message(job = self.job_name + ' - Catalog',run_time= self.run_time,new_refs=new_intel_refs ,changed_refs=updated_intel_refs,removed_refs=removed_intel_refs)
                self.filtered_catalog_df = pd.concat([added,deleted,after_updated,existing],axis=0,ignore_index=True)
            else:
                print("No change in Catalog data")
                self.slack_message += get_error_message(job = self.job_name+ ' - Catalog',run_time = self.run_time,message= 'No change in Catalog Data') + '\n'
        else:
            print("No Fresh data found for Catalog Data")
        # Load ICS table
        if existing_ics_df.shape[0]<1 and fresh_ics_df.shape[0]>0:
            print("Fresh Load to table :: " + self.ics_table)
            fresh_cols = ['ics_title','facility_title','facility_description','standard_title','standard_stage','standard_details.Status']
            df = fresh_ics_df[fresh_cols].drop_duplicates()
            df.columns = existing_ics_df.iloc[:,:-2].columns.tolist()
            df['is_deleted'] = False
            self.filtered_ics_df = df
        elif existing_ics_df.shape[0]>0 and fresh_ics_df.shape[0]>0:
            print("Data existed in ICS table")
            new_intel_refs = []
            removed_intel_refs = []
            updated_intel_refs = []
            fresh_cols = ['ics_title', 'facility_title', 'facility_description', 'standard_title','standard_stage', 'standard_details.Status']
            old_db = existing_ics_df.query("is_deleted == False").iloc[:, :-2]
            new_db = fresh_ics_df[fresh_cols].drop_duplicates()
            new_db.columns = existing_ics_df.iloc[:,:-2].columns.tolist()
            added, deleted, before_updated, after_updated, existing = get_diff(p_key[self.ics_table], old_db,new_db)
            print("+++++++++++ new_refs     : " + str(added.shape[0]))
            print("+++++++++++ deleted_refs : " + str(deleted.shape[0]))
            print("+++++++++++ updated_refs : " + str(after_updated.shape[0]))
            print("+++++++++++ NC_refs      : " + str(existing.shape[0]))
            added['is_deleted'] = after_updated['is_deleted'] = existing['is_deleted'] = False
            before_updated['is_deleted'] = deleted['is_deleted'] = True
            if added.shape[0] > 0 or deleted.shape[0] > 0 or after_updated.shape[0] > 0:
                print("Data Modified for ICS")
                if added.shape[0]>0:
                    new_intel_refs = added[p_key[self.ics_table]].apply("-".join, axis=1).tolist()
                if deleted.shape[0]>0:
                    removed_intel_refs = deleted[p_key[self.ics_table]].apply("-".join, axis=1).tolist()
                if after_updated.shape[0]>0:
                    updated_intel_refs = after_updated[p_key[self.ics_table]].apply("-".join, axis=1).tolist()
                self.intel_records += get_intel(new_refs=new_intel_refs,removed_refs=removed_intel_refs,changed_refs=updated_intel_refs,run_time=datetime.now(),identifier=self.ics_tag)
                self.filtered_ics_df = pd.concat([added, deleted, after_updated, existing], axis=0,ignore_index=True)
                if len(self.intel_records) > 0:
                    self.slack_message += get_slack_message(job = 'ISO - ICS',run_time= self.run_time,new_refs=new_intel_refs ,changed_refs=updated_intel_refs,removed_refs=removed_intel_refs)

            else:
                print("No change in ICS data")
                self.slack_message += '\n' +  get_error_message(job = 'ISO - ICS',run_time = self.run_time,message= 'No change in ICS Data') + '\n'
        else:
            print("No Fresh Data Found for ICS ")
        # Load Standards table
        if existing_standards_df.shape[0]<1 and fresh_ics_df.shape[0]>0:
            print("Fresh Load to table :: "+self.standards_table)
            fresh_cols = [ 'standard_title', 'standard_description','standard_stage', 'standard_details.abstract' ,'standard_details.Status', 'standard_details.Publication_date','standard_details.Edition', 'standard_details.Number_of_pages', 'standard_details.Technical_Committee', 'standard_details.ICS','standard_details.preview_doc']
            df = fresh_ics_df[fresh_cols].drop_duplicates()
            df.columns = existing_standards_df.iloc[:, :-2].columns.tolist()
            df['is_deleted'] = False
            self.filtered_standards_df = df

        elif existing_standards_df.shape[0]>0 and fresh_ics_df.shape[0]>0:
            print("Data Existed in  table :: " + self.standards_table)
            new_intel_refs = []
            removed_intel_refs = []
            updated_intel_refs = []
            fresh_cols = ['standard_title', 'standard_description', 'standard_stage' ,'standard_details.abstract',
                          'standard_details.Status', 'standard_details.Publication_date', 'standard_details.Edition',
                          'standard_details.Number_of_pages', 'standard_details.Technical_Committee',
                          'standard_details.ICS','standard_details.preview_doc']
            old_db = existing_standards_df.query("is_deleted == False").iloc[:, :-2]
            new_db = fresh_ics_df[fresh_cols].drop_duplicates()
            new_db.columns = existing_standards_df.iloc[:,:-2].columns.tolist()
            added, deleted, before_updated, after_updated, existing = get_diff(p_key[self.standards_table], old_db,new_db)
            print("+++++++++++ new_refs     : " + str(added.shape[0]))
            print("+++++++++++ deleted_refs : " + str(deleted.shape[0]))
            print("+++++++++++ updated_refs : " + str(after_updated.shape[0]))
            print("+++++++++++ NC_refs      : " + str(existing.shape[0]))
            added['is_deleted'] = after_updated['is_deleted'] = existing['is_deleted'] = False
            before_updated['is_deleted'] = deleted['is_deleted'] = True
            if added.shape[0] > 0 or deleted.shape[0] > 0 or after_updated.shape[0] > 0:
                print("Data Modified for standards")
                if added.shape[0]>0:
                    new_intel_refs = added[p_key[self.standards_table]].apply("-".join, axis=1).tolist()
                if deleted.shape[0]>0:
                    removed_intel_refs = deleted[p_key[self.standards_table]].apply("-".join, axis=1).tolist()
                if after_updated.shape[0]>0:
                    updated_intel_refs = after_updated[p_key[self.standards_table]].apply("-".join, axis=1).tolist()
                self.intel_records += get_intel(new_refs=new_intel_refs,removed_refs=removed_intel_refs,changed_refs=updated_intel_refs,run_time=datetime.now(),identifier=self.stand_tag)
                self.filtered_standards_df = pd.concat([added, deleted, after_updated, existing], axis=0,ignore_index=True)
                if len(self.intel_records) > 0:
                    self.slack_message += get_slack_message(job = self.job_name,run_time= self.run_time,new_refs=new_intel_refs ,changed_refs=updated_intel_refs,removed_refs=removed_intel_refs)
            else:
                print("No change in Standards data")
                self.slack_message += '\n' + get_error_message(job = self.job_name,run_time = self.run_time,message= 'No change in Standards Data') + '\n'
        else:
            print("No Fresh Data Found for Standards ")
        # print(self.slack_message)
        return