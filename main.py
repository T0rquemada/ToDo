import sqlite3
import json
from functools import wraps

from flask import Flask, render_template, request, jsonify

app = Flask(__name__, static_url_path='/static')


# Provides connection/cursor to DB
def open_db(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        connection = sqlite3.connect('data.db')
        cursor = connection.cursor()
        try:
            result = func(cursor, *args, **kwargs)
            connection.commit()
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            cursor.close()
            connection.close()
        return result
    return wrapper


def create_user_table(cur) -> None:
    try:
        cur.execute(f'''CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nickname TEXT NOT NULL,
            password TEXT NOT NULL,
            email TEXT NOT NULL
            )''')
        print('Table "users" created successfully!')
    except Exception as e:
        print(e)


def create_tasks_table(cur) -> None:
    try:
        cur.execute(f'''CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title CHAR(30) NOT NULL,
            description TEXT NOT NULL,
            complete BOOLEAN NOT NULL,
            creator_id INTEGER NOT NULL,
            FOREIGN KEY (creator_id) REFERENCES users(id)
            )''')
        print('Table "tasks" created successfully!')
    except Exception as e:
        print(e)


# Check, that user already exist in 'users' table. Return True/False
def already_user(cur, email: str) -> bool:
    try:
        cur.execute("SELECT * FROM users WHERE email=?", (email,))
    except Exception as e:
        print("Error while selecting user in already_user(): ", e)

    row = cur.fetchone()
    if row is not None:
        return True
    return False


def create_user_task(cur, task):
    try:
        title = task['title']
        desc = task['desc']
        complete = task['complete']
        creator_id = task['creator_id']
        print(task)

        query = "INSERT INTO tasks (title, description, complete, creator_id) VALUES (?, ?, ?, ?)"
        cur.execute(query, (title, desc, complete, creator_id))
        print('User task created successfully')
    except Exception as e:
        raise RuntimeError('Error while creating user task: ' + str(e))


def insert_user(cur, user) -> None:
    try:
        nickname = user['nickname']
        password = user['password']
        email = user['email']

        queue = 'INSERT INTO users (nickname, password, email) VALUES (?, ?, ?)'
        cur.execute(queue, (nickname, password, email))
        print('User inserted successfully!')
    except Exception as e:
        print(e)


@app.route("/signup", methods=['POST'])
@open_db
def sign_up(cursor) -> str:

    user = request.json  # Extract JSON-formatted data from POST-request
    if already_user(cursor, user['email']):
        print('User already exists!')
        return 'User already exist!'
    insert_user(cursor, user)

    query = "SELECT id FROM users WHERE email=?"
    cursor.execute(query, (user['email'], ))
    user['id'] = cursor.fetchone()[0]
    return f'User registered successfully! user={json.dumps(user)}'


@app.route("/signin", methods=['POST'])
@open_db
def sign_in(cursor):
    try:
        user_in_request = request.json
        if already_user(cursor, user_in_request['email']):
            queue = f"SELECT * FROM users WHERE email=?"
            cursor.execute(queue, (user_in_request['email'],))
            user_in_db = list(cursor.fetchone())    # Transform tuple in list
            if user_in_db[2] == user_in_request['password']:
                return f'Logged in successfully! user={json.dumps(user_in_db)}'
            else:
                return 'Wrong password!'
        else:
            return 'User with this email does not exist!'
    except Exception as e:
        print(e)
        return 'Error while sign in', 500


@app.route("/createtask", methods=['POST'])
@open_db
def create_task(cursor):
    try:
        task = request.json
        create_user_task(cursor, task)
        return 'Task created successfully!'
    except Exception as e:
        print(e)
        return 'Error while creating task', 500


@app.route("/tasks", methods=['GET'])
@open_db
def get_tasks(cursor):
    creator_id = request.args.get('creator_id')
    try:
        query = 'SELECT * FROM tasks WHERE creator_id=?'
        cursor.execute(query, (creator_id,))
        tasks = list(cursor.fetchall())

        return json.dumps(tasks)
    except Exception as e:
        print('Error while getting tasks', e)
        return 'Error while getting tasks', 500


@app.route("/tasks/<int:task_id>", methods=['PUT'])
@open_db
def update_task(cursor, task_id):
    try:
        complete_status = request.json.get('complete')
        queue = 'UPDATE tasks SET complete= ? WHERE id=?'
        cursor.execute(queue, (complete_status, task_id))

        return jsonify({'complete': complete_status})
    except Exception as e:
        print('Error while updating task: ', e)
        return jsonify({'error': str(e)}), 500


@app.route("/tasks/<int:task_id>", methods=['DELETE'])
@open_db
def delete_task(cursor, task_id):
    try:
        queue = 'DELETE FROM tasks WHERE id=?'
        cursor.execute(queue, (task_id, ))

        return 'Task deleted successfully!', 200
    except Exception as e:
        print('Error while updating task: ', e)
        return jsonify({'error': str(e)}), 500


@app.route("/")
def index(name=None):
    return render_template('index.html', name=name)


if __name__ == '__main__':
    app.run(debug=True)
