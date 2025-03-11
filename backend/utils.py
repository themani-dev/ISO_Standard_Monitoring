import pandas as pd
from bs4 import BeautifulSoup
import requests
from pytz import timezone

def get_diff(p_key_clmn,old_df,new_df):
    change_names = lambda lst, key_id: [item.replace(key_id, '') if key_id in item else item for item in lst]
    # test = old_df.merge(new_df,how="right",indicator=True,on=p_key_clmn).loc[lambda x: x['_merge'] == 'right_only']
    # test.to_csv('data/added.csv',index=False)
    added = old_df.merge(new_df,how="right",indicator=True,on=p_key_clmn).loc[lambda x: x['_merge'] == 'right_only'].dropna(axis=1, how='all')
    if added.shape[0]>0:
        added.drop(columns='_merge',inplace=True)
        added.columns = change_names(added.columns.tolist(), '_y')
    deleted = old_df.merge(new_df,how="left",indicator=True,on=p_key_clmn).loc[lambda x: x['_merge'] == 'left_only'].dropna(axis=1, how='all')
    if deleted.shape[0]>0:
        deleted.drop(columns='_merge',inplace=True)
        deleted.columns = change_names(deleted.columns.tolist(), '_x')
    common = old_df.merge(new_df,how="inner",indicator=False,on=p_key_clmn)
    #extract updated and non updated records in new dataset
    new_cols = [c for c in common.columns if c.endswith("_y") or c in p_key_clmn]
    old_cols = [c for c in common.columns if c.endswith("_x") or c in p_key_clmn]
    existing = after_updated = before_updated = pd.DataFrame(columns=old_df.columns)
    for i in range(common.shape[0]):
        val1 = val2 = ''
        for col in common.columns:
            if col.endswith("_x"):
                val1+=str(common[col][i])
            elif col.endswith("_y"):
                val2+= 'None' if str(common[col][i]) == 'nan' else str(common[col][i])
        if val1 == val2:
            match = common[new_cols].iloc[[i]].set_axis(change_names(common[new_cols].columns.tolist(),'_y'),axis=1)
            existing = pd.concat([existing,match],axis=0,ignore_index=True)
        else:
            after_changed = common[new_cols].iloc[[i]].set_axis(change_names(common[new_cols].columns.tolist(),'_y'),axis=1)
            before_changed = common[old_cols].iloc[[i]].set_axis(change_names(common[new_cols].columns.tolist(),'_y'),axis=1)
            after_updated = pd.concat([after_updated,after_changed],axis=0,ignore_index=True)
            before_updated = pd.concat([before_updated,before_changed],axis=0,ignore_index=True)
            # if "ISO/DIS 6872" in before_changed["title"].to_list():
            #     with open("data/test.txt",'w') as file_obj:
            #         temp = pd.concat([before_changed,after_changed],axis = 0)
            #         after_updated.to_csv("data/after.csv",index=False)
            #         before_updated.to_csv("data/before.csv", index=False)
            #         common[new_cols].iloc[[i]].to_csv("data/merged.csv",index=False)
            #         file_obj.write(val1)
            #         file_obj.write("\n")
            #         file_obj.write(val2)
            #     file_obj.close()
    return added,deleted,before_updated,after_updated,existing

def get_raw_data(url):
    headers = {"User-Agent": "Mozilla/5.0 (X11; U; Linux i686) Gecko/20071127 Firefox/2.0.0.11"}
    response = requests.get(url, headers=headers)
    soup_obj = BeautifulSoup(response.text, 'html.parser')
    return soup_obj

def format_intel_record(ref, change_type, run_time, identifier, param={}):
    _dct = dict()
    _dct['type'] = identifier
    _dct['value'] = ref
    _dct['param'] = param
    _dct['updated_at'] = run_time
    _dct['change_type'] = change_type
    return _dct


def get_intel(new_refs, removed_refs, changed_refs,  run_time, identifier):
    _intel_records = []
    for record in new_refs:
        _dct = format_intel_record(record, 'ADD', run_time, identifier)
        _intel_records.append(_dct)
    for record in removed_refs:
        _dct = format_intel_record(record, 'DEL', run_time, identifier)
        _intel_records.append(_dct)
    for record in changed_refs:
        _dct = format_intel_record(record, 'CNG', run_time, identifier)
        _intel_records.append(_dct)
    return _intel_records

def get_slack_message(job, run_time, new_refs, changed_refs, removed_refs):
    job_name = job + "-" + run_time.astimezone(timezone('US/Pacific')).strftime("%b %d, %Y %H:%M") + " PST"
    msg = ':star: *{0}:* \n\n'.format(job_name)
    if len(new_refs) > 0:
        msg += "> :white_check_mark: *{0}* entries _ADDED_ - {1} \n\n".format(len(new_refs), ', '.join(["`{}`".format(value) for value in list(map(str, new_refs))]))
    if len(changed_refs) > 0:
        msg += "> :warning: *{0}* entries _MODIFIED_ - {1} \n\n".format(len(changed_refs), ', '.join(["`{}`".format(value) for value in list(map(str, changed_refs))]))
    if len(removed_refs) > 0:
        msg += "> :x: *{0}* entries _DELETED_ - {1}".format(len(removed_refs), ', '.join(["`{}`".format(value) for value in list(map(str, removed_refs))]))
    return msg

def get_error_message(job, run_time, message):
    job_name = job + "-" + run_time.astimezone(timezone('US/Pacific')).strftime("%b %d, %Y %H:%M") + " PST"
    msg = ':star: *{0}:* \n\n'.format(job_name)
    msg += "> :x: {0}".format(message)
    return msg