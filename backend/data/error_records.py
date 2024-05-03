import pandas as pd

def get_diff(p_key_clmn,old_df,new_df):
    change_names = lambda lst, key_id: [item.replace(key_id, '') if key_id in item else item for item in lst]
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
    print(deleted)
    return added,deleted,before_updated,after_updated,existing

df1 = pd.read_csv('df1.csv',header=0)
df1 = df1.iloc[:,:-2]
df2 = pd.read_csv("df2.csv",header=0)
df2 = df2.iloc[:,:-2]
key = ["ics_title","facility_title","standard_title","standard_stage"]
get_diff(p_key_clmn=key,old_df=df1,new_df=df2)
