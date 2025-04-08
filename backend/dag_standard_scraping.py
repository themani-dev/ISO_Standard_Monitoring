from airflow import DAG
from utils.dag_structure import schedule_dag,default_args
from iso_datascrape import Load_ICS_Standards


iso_scraping_schedule = "45 11 * * *"


dag_ics_standards = DAG(
    dag_id="iso_standards_scraper", 
    schedule_interval=iso_scraping_schedule,
    default_args=default_args, 
    catchup=False,
    tags=['webscraping','ISO Standards']
    )
schedule_dag(dag_ics_standards, Load_ICS_Standards())