#!/bin/bash

echo "Setting up database"
touch data.db

python3 << END
import sqlite3

con = sqlite3.connect('data.db')
cur = con.cursor()

try:
    # Create 'users' table
    cur.execute('''CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nickname TEXT NOT NULL,
            password TEXT NOT NULL,
            email TEXT NOT NULL
            )''')
    print('Table "users" created successfully!')

    # Create 'tasks' table
    cur.execute('''CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title CHAR(30) NOT NULL,
            description TEXT NOT NULL,
            complete BOOLEAN NOT NULL,
            creator_id INTEGER NOT NULL,
            FOREIGN KEY (creator_id) REFERENCES users(id)
            )''')
    print('Table "tasks" created successfully!')
except Exception as e:
    print("Error while creating tables: ", e)
finally:
    con.commit()
    con.close()
END

echo "Setting up venv and installing Flask"
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
