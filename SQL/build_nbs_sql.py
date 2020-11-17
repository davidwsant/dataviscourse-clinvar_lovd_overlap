
import sqlite3
import csv

db = sqlite3.connect('NBS_sql.db')
cursor = db.cursor()
cursor.execute('''
    create table valid (
        HGVS text, DB_Accession text, Database text, Chr text, Start integer, Stop integer, Ref text, Alt text,
        Type text, Length integer, Pathogenicity text, Disease text, Gene text, Review_Status text,
        Star_Level text, Submitter text, Frequency real, primary key (HGVS, DB_Accession)
    )'''
)

cursor.execute('''
    create table invalid (
        DB_Accession text, Database text, Gene text, Disease text, Type text, Pathogenicity text,
        Review_Status text, Star_Level text, Submitter text, Reason text, Duplicated integer,
        primary key (DB_Accession)
    )'''
)

with open('All_Valid_SQL_Input.csv') as file:
    reader = csv.DictReader(file)
    for row in reader:
        info_list = [row['HGVS Normalized Genomic Annotation'], row['Database Accession'], row['Database'],
            row['Chr'], row['Position Start'], row['Position Stop'], row['Ref'], row['Alt'], row['Variant Type'],
            row['Variant Length'], row['Pathogenicity'], row['Disease'], row['Gene Symbol'],
            row['Review Status'], row['Star Level'], row['Submitter'], row['Overall_MAF']
        ]
        q_list = ['?']*len(info_list)
        cursor.execute('insert into valid values ('+(',').join(q_list)+')', info_list)
        # This needs to have the question marks so that it does not mess up the command if you have a
        # SQL command in the insert statement

with open('All_Invalid_SQL_Input.csv') as file:
    reader = csv.DictReader(file)
    for row in reader:
        info_list = [row['Database Accession'], row['Database'], row['Gene Symbol'], row['Disease'],
            row['Variant Type'], row['Pathogenicity'], row['Review Status'], row['Star Level'],
            row['Submitter'], row['HGVS Normalization Failure Reason'], row['Duplicated']
        ]
        q_list = ['?']*len(info_list)
        cursor.execute('insert into invalid values ('+(',').join(q_list)+')', info_list)

db.commit()
