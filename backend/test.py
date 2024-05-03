from utils import get_raw_data
import re
from datetime import datetime

def get_standard_details(soup_obj):
    section_id = 'product-details'  # Replace with the ID of the section you want to scrape
    item_prop = 'description'  # replace item_prop name to extract standard details
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
    doc_url = section.find_all('a',id='obp-preview')
    if doc_url is not None:
        if len(doc_url)>0:
            ret['preview_doc'] = doc_url[0].get('href')
    else:
        ret['preview_doc'] = None
    if stat:
        for item in stat:
            val = item.get_text().strip()
            if len(val) > 0:
                val = re.sub(r'\n+', '\n', val)
                # print(val)
                if len(val.split(':')) > 2:
                    val = val.split("\n")
                    for item in val:
                        item = item.split(":")
                        ret[item[0].strip().replace(' ', '_')] = item[1].strip().replace('\n', ' ')
                else:
                    temp1 = val.split(":")
                    ret[temp1[0].strip().replace(' ', '_')] = temp1[1].strip().replace('\n', ' ')
    val = ret['ICS']
    if len(val) >0:
        val1 = re.split(r'\s{2,}', val)
        lst = []
        for item in val1:
            temp = {}
            temp1 = item.split(' ', 1)
            temp['ics'] = temp1[0]
            temp['desc'] = temp1[1]
            lst.append(temp)
        ret['ICS'] = lst
    return ret

def get_metadata(soup_obj,load_type):
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
                                payload['title'] = header.find('a').text
                                payload['url'] = header.find('a').get('href')
                                payload['title'] = header.text
                                payload['description'] = payload['title'].split('\n')[-2]  # removing additional spaces
                                payload["title"] = payload['title'].split('\n')[-3].strip()
                                print(header.find('a').find('i').get('class'))
                        except Exception as e:
                            print("Error while getting standards Details :: "+str(e))
                if len(payload) > 0:
                    res.append(payload)
    return res

# url = 'https://www.iso.org/standard/41203.html'
# url = 'https://www.iso.org/standard/64686.html'
# url = 'https://www.iso.org/standard/22101.html'
# soup_obj = get_raw_data(url=url)
# metadata = get_standard_details(soup_obj=soup_obj)
# print(metadata)

import json
import pandas as pd
def prepare_data():
    result = pd.DataFrame()
    f = open('data/extract_iso_standards.json','r')
    data = json.loads(f.read())
    ics_df = pd.json_normalize(data)
    key_clm = ['ics_title','facility_title','standard_title']
    print(ics_df[key_clm].apply("-".join,axis=1).tolist())
    return ics_df

# prepare_data()
date = datetime.now().strftime('%Y%m%d%H%M%S')
print(date)