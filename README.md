# Multi-user ToDo list

## To build
Clone repo
```shell
git clone https://github.com/T0rquemada/ToDo.git
```
### Automatically
1. Run **build.sh** file
```shell
./build.sh
```
If you can't run ./build.sh, run ```chmod +x build.sh``` (It's add execute permission for file) <br>
2. Activate venv
```shell
source venv/bin/activate
```
3. Run flask app
```shell
flask --app main run
```
4. Open web page in browser
### Manually
1. Create "data.db" file
2. Create .py file in root of project, and copy code under in it. Then run it. This will create tables in database
```python
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
    con.rollback()
    print("Error while creating tables: ", e)
finally:
    con.commit()
    con.close()
```
3. Activate venv
```shell
 python3 -m venv venv
```
4. Install dependencies
```shell
pip install -r requirements.txt
```
5. Run flask app
```shell
flask --app main run
```

## To run
1. Activate venv
```shell
source venv/bin/activate
```
2. Run flask app
```shell
flask --app main run
```
## ToDo:
- [ ] Editing/Deleting tasks
- [ ] Sort completed task in end of task list
- [ ] Task tabs
- [ ] Common task tabs

#### Used packages
1. Flask
2. sqlite3
3. json
4. functools