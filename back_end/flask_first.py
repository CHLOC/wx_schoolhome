import sys
from flask import Flask, request, json, jsonify
import urllib.request
import sqlite3
#import httplib

defaultencoding = 'utf-8'
if sys.getdefaultencoding() != defaultencoding:
    reload(sys)
    sys.setdefaultencoding(defaultencoding)

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def code2tx(user_code):
    appid = 'wx483464ec5d83bac5'
    app_secret = 'b1a2dabfc6ec699e8b4d1e860bccef0c'
    tx_url=''.join(('https://api.weixin.qq.com/sns/jscode2session?appid='
        ,appid
        ,'&secret='
        ,app_secret
        ,'&js_code='
        ,user_code
        ,'&grant_type=authorization_code'))
    print (tx_url);
    tx_res_data = urllib.request.urlopen(tx_url)
    print (tx_res_data)
    print (type(tx_res_data))
    res = tx_res_data.read()
    print (res.decode())
    print (type(res))
    res_dict = json.loads(res.decode())
    print (res_dict)
    print (type(res_dict))
    print (res_dict['openid'])
    return (res_dict)

def openid_to_person_info(openid):
    db_connect = sqlite3.connect('school.db')
    db_connect.row_factory = dict_factory
    db_cursor = db_connect.cursor()
    db_cursor.execute("SELECT person_id, is_teacher, name FROM wx_to_person WHERE openid=?",(openid,))
    person_info = db_cursor.fetchone()
    db_connect.close()
    print ("person_info")
    print (person_info)
    return person_info

def get_student_class(person_id):
    print ("get_student_class")
    print (person_id)
    db_connect = sqlite3.connect('school.db')
    db_connect.row_factory = dict_factory
    db_cursor = db_connect.cursor()
    db_cursor.execute("SELECT class_id, id_in_class FROM student_info WHERE person_id=? AND current_class=1",(person_id,))
    class_info = db_cursor.fetchone()
    print (class_info)
    db_connect.close()
    return (class_info)
    
def get_score_from_db(class_info):
    print ("get_score_from_db")
    db_connect = sqlite3.connect('school.db')
    db_connect.row_factory = dict_factory
    db_cursor = db_connect.cursor()
    db_cursor.execute("SELECT name FROM sqlite_master WHERE TYPE='table' AND NAME=?",(("class_score_" + str(class_info['class_id'])),))
    row = db_cursor.fetchone()
    print (row)
    all_score_row = []
    if (row):
        table_name = row['name']
        print (table_name)
        db_cursor.execute("SELECT subject_name, score, date FROM "+table_name+" WHERE id_in_class = ? ORDER BY date", (class_info['id_in_class'],))
        all_score_row = db_cursor.fetchall()
        print (all_score_row)
    db_connect.close()
    return (all_score_row)

def score_row_to_score(all_score_row):
    all_subject_detail = {}
    for line in all_score_row:
        name = line['subject_name']
        #name_utf8 = name.decode(encoding='utf-8')
        name_utf8 = name #python3 all str is unicode
        #if (line['name'] not in subject_name.key):
        #if (not all_subject_detail.has_key(name_utf8)):
        if (name_utf8 not in all_subject_detail):
            all_subject_detail[name_utf8] = {
                'name': name,
                'node': []
                }
        all_subject_detail[name_utf8]['node'].append({
            'date': line['date'],
            'score': line['score']
            })
    print (all_subject_detail)
    return (all_subject_detail)

def get_homework_from_db(class_info):
    print ("get_score_from_db")
    db_connect = sqlite3.connect('school.db')
    db_connect.row_factory = dict_factory
    db_cursor = db_connect.cursor()
    db_cursor.execute("SELECT subject_name, time, homework_content, deadline_date FROM homework WHERE class_id = ? AND date('now')<=deadline_date ORDER BY deadline_date", (class_info['class_id'],))
    all_homework_row = db_cursor.fetchall()
    print (all_homework_row)
    db_connect.close()
    return (all_homework_row)

def homewrk_row_to_homework(all_homework_row):
    all_subject_detail = {}
    for line in all_homework_row:
        name = line['subject_name']
        #name_utf8 = name.decode(encoding='utf-8')
        name_utf8 = name #python3 all str is unicode
        #if (line['name'] not in subject_name.key):
        #if (not all_subject_detail.has_key(name_utf8)):
        if (name_utf8 not in all_subject_detail):
            all_subject_detail[name_utf8] = {
                'name': name,
                'node': []
                }
        all_subject_detail[name_utf8]['node'].append({
            'deadline_date': line['deadline_date'],
            'homework_content': line['homework_content'],
            'time': line['time']
            })
    print (all_subject_detail)
    return (all_subject_detail)

def get_article_from_db(class_info):
    print ("get_article_from_db")
    db_connect = sqlite3.connect('school.db')
    db_connect.row_factory = dict_factory
    db_cursor = db_connect.cursor()
    print ("class_id")
    print (class_info['class_id'])
    print (type(class_info['class_id']))
    print (class_info['class_id']/100)
    db_cursor.execute("SELECT id, title, date, author_name FROM bbs WHERE ((school_level) OR (grade_level AND grade = ?) OR ((NOT school_level) AND (NOT grade_level) AND class_id = ?))", (int(class_info['class_id']/100),class_info['class_id']))
    all_article_row = db_cursor.fetchall()
    print (all_article_row)
    db_connect.close()
    return (all_article_row)

app = Flask(__name__)
app.debug = True

@app.route('/')
def hello_world():
    return "Hello QiuRui!"

@app.route('/homework',methods=['POST'])
def get_homework():
    print ("get homework")
    data_json = request.get_json()
    print (data_json)
    person_info = data_json['person_info']
    all_homework_row = get_homework_from_db(person_info['class_info']);
    all_homework = homewrk_row_to_homework(all_homework_row)
    print (all_homework)
    res = all_homework
    return jsonify(res)

@app.route('/login',methods=['POST'])
def wxlogin():
    print ("wxlogin--")
    code_json = request.get_json()
    print (code_json)
    user_code = code_json['code']
    tx_res = code2tx(user_code)
    person_info = openid_to_person_info(tx_res['openid'])
    class_info = get_student_class(person_info['person_id'])
    person_info['class_info'] = class_info
    print ("wxlogin++")
    res = person_info
    return jsonify(res)

@app.route('/score',methods=['POST'])
def get_score():
    print ("get_score--")
    data_json = request.get_json()
    print (data_json)
    person_info = data_json['person_info']
    person_id = person_info['person_id']
    all_score_row = get_score_from_db(person_info['class_info'])
    all_score = score_row_to_score(all_score_row)
    print ("get_score++")
    res = all_score
    return jsonify(res)

@app.route('/bbs',methods=['POST'])
def get_bbs():
    print ("get_bbs--")
    data_json = request.get_json()
    print (data_json)
    person_info = data_json['person_info']
    all_article_row = get_article_from_db(person_info['class_info'])
    #all_article_list = article_row_to_article_list(all_article_row)
    print ("get_bbs++")
    res = all_article_row
    return jsonify(res)

if (__name__ == '__main__'):
    app.run(
        debug = True,
        host = '0.0.0.0'
    )
