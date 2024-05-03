select * from
(
select facility_title,standard_title,standard_stage,standard_status from tbl_ics
where updated_on = (select max(updated_on) from tbl_ics)
)t1
left join
(
	select title,stage,status from tbl_iso_standards where updated_on = (select max(updated_on) from tbl_iso_standards)
)t2
on t1.standard_title = t2.title
where status is null;
------------------------------------------------------------------
select standard_title,count(facility_title) from tbl_ics
where updated_on = (select max(updated_on) from tbl_ics)
group by 1
order by 2 desc;
------------------------------------------------------------------
select standard_title,standard_stage,facility_title from tbl_ics
where updated_on = (select max(updated_on) from tbl_ics)
and standard_title = 'ISO/DIS 80369-20';
-----------------------------------------------------------------

select title,ics,preview_doc from tbl_iso_standards
where updated_on = (select max(updated_on) from tbl_iso_standards)
and preview_doc like 'http%'