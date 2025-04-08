from datetime import datetime,timedelta
from airflow import DAG
from common import schedule_dag
from iso_datascrape import Load_ICS_Standards


iso_scraping_schedule = "45 11 * * *"

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email': ['themanidev@gmail.com'],
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
    'start_date': datetime(2024, 4, 7),
    'catchup': False
}

dag_ics_standards = DAG(
    dag_id="iso_standards_scraper", 
    schedule_interval=iso_scraping_schedule,
    default_args=default_args, 
    catchup=False,
    tags=['webscraping','ISO Standards']
    )
schedule_dag(dag_ics_standards, Load_ICS_Standards())