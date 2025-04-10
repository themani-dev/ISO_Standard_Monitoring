import airflow
from airflow.operators.python_operator import PythonOperator
from airflow.providers.slack.operators.slack_webhook import SlackWebhookOperator
from datetime import datetime, timedelta
from utils.settings import notify_email_ids
import pickle
import os,shutil

default_args = {
            "owner": "Mani Dev",
            "start_date": airflow.utils.dates.days_ago(1), #datetime(2021,11,7 ,0,0,0),
            "max_active_runs" : 1,
            "dagrun_timeout" : timedelta(seconds=3600),
            "catchup" : False,
            "email_on_failure": True,
            "email_on_retry": True,
            "email": notify_email_ids,
            "retries": 1,
            "retry_delay": timedelta(minutes=5),
            "depends_on_past": False
        }


def schedule_dag(dag, dataloader):

    def get_dag_folder_path(ts, dag_id):
        timestamp = datetime.strptime(ts, "%Y-%m-%dT%H:%M:%S.%f%z").strftime("%Y%m%d_%H%M%S")
        folder_path = f"/tmp/{dag_id}/dataloader_{timestamp}.pkl"
        os.makedirs(os.path.dirname(folder_path), exist_ok=True)
        return folder_path

    def prepare_data(**kwargs):
        folder = get_dag_folder_path(kwargs['ts'], kwargs['dag'].dag_id)
        dataloader.prepare_data()
        with open(folder, 'wb') as f:
            pickle.dump(dataloader, f)

    def load_data(**kwargs):
        folder = get_dag_folder_path(kwargs['ts'], kwargs['dag'].dag_id)
        with open(folder, 'rb') as f:
            loader = pickle.load(f)
        loader.load_to_rdbms()

    def slack_notification(**kwargs):
        folder = get_dag_folder_path(kwargs['ts'], kwargs['dag'].dag_id)
        with open(folder, 'rb') as f:
            loader = pickle.load(f)
        if loader.slack_message:
            alert = SlackWebhookOperator(
                task_id="alert",
                slack_webhook_conn_id="slack_connection",
                message=loader.slack_message,
                username='airflow-bot',
                dag=dag,
            )
            return alert.execute(context=None)

    def dag_cleanup(**kwargs):
        folder = f"/tmp/{kwargs['dag'].dag_id}"
        if os.path.isdir(folder):
            shutil.rmtree(folder)
            print(f"Removed folder: {folder}")
        else:
            print(f"Folder does not exist: {folder}")

    prepare_data_task = PythonOperator(
        task_id='prepare_data',
        python_callable=prepare_data,
        dag=dag
    )

    load_data_task = PythonOperator(
        task_id='load_data',
        python_callable=load_data,
        dag=dag
    )

    send_slack_notification = PythonOperator(
        task_id="send_slack_notification",
        python_callable=slack_notification,
        dag=dag
    )

    cleanup_task = PythonOperator(
        task_id="cleanup",
        python_callable=dag_cleanup,
        dag=dag
    )

    prepare_data_task >> load_data_task >> send_slack_notification >> cleanup_task
