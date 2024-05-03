CREATE TABLE tbl_iso_standards
(
    title TEXT NOT NULL,
    description TEXT,
    stage TEXT,
    abstract TEXT,
    status TEXT,
    publication_date TEXT,
    edition TEXT,
    no_of_pages TEXT,
    technical_committee TEXT,
    ics TEXT,
    preview_doc TEXT,
    is_deleted BOOLEAN,
    updated_on TIMESTAMP,
    primary key(title,stage,is_deleted,updated_on)
)