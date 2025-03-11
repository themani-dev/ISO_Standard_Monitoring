CREATE TABLE tbl_ics (
ics_title TEXT NOT NULL,
facility_title TEXT NOT NULL,
facility_description VARCHAR(1000),
standard_title TEXT NOT NULL,
standard_stage TEXT,
standard_status TEXT,
is_deleted BOOLEAN,
updated_on TIMESTAMP,
PRIMARY KEY (ics_title,facility_title,standard_title,standard_stage,is_deleted,updated_on)
)