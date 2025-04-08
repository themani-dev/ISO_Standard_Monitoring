import airflow
from airflow.operators.python_operator import PythonOperator
from airflow.providers.slack.operators.slack_webhook import SlackWebhookOperator
from datetime import datetime, timedelta
from utils.settings import environment, slack_channel, notify_email_ids

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
    def slack_notification(**kwargs):
        ti = kwargs['ti']
        loader = ti.xcom_pull(task_ids='prepare_data', key='loader')
        if loader.slack_message is not None:
            alert = SlackWebhookOperator(
                task_id="alert",
                http_conn_id="slack_conn",
                message=loader.slack_message,
                channel=slack_channel,
                dag=dag
            )
            return alert.execute(context=None)
        else:
            return None

    def prepare_data(**kwargs):
        dataloader.prepare_data()
        ti = kwargs['ti']
        ti.xcom_push('loader', dataloader)

    def load_data(**kwargs):
        ti = kwargs['ti']
        loader = ti.xcom_pull(task_ids='prepare_data', key='loader')
        loader.load_to_rdbms()

    send_slack_notification = PythonOperator(
        task_id="send_slack_notification",
        python_callable=slack_notification,
        wait_for_downstream=False,
        dag=dag
    )

    prepare_data = PythonOperator(
        task_id='prepare_data',
        python_callable=prepare_data,
        wait_for_downstream=False,
        dag=dag
    )

    load_data = PythonOperator(
        task_id='load_data',
        python_callable=load_data,
        wait_for_downstream=False,
        dag=dag
    )

    prepare_data >> load_data #>> send_slack_notification
