CREATE TABLE tbl_iso_hct_catalog (
title TEXT NOT NULL,
description VARCHAR(1000),
is_deleted boolean,
updated_on TIMESTAMP,
PRIMARY KEY (title,updated_on)
)