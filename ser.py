from flask import Flask, render_template, request, session , redirect
import MySQLdb
import time
import datetime
import cv2


app = Flask(__name__)
app.secret_key='gfghfgfhgfhhhg'


def seslogcheck():
   print 'CHECKING'
   if 'userid' in session:

      return 1
   else:
      print 'not logged in '
      return 0

def logstat():
   dat=[]
   if(seslogcheck()==0):

      dat.append(('Login','login'))
      #dat.append('login')
   elif(seslogcheck()==1):
      dat.append(('My Account','myaccount'))
   return dat



def takepic(userid):
   cam = cv2.VideoCapture(0)
   s, im = cam.read()
   cam.release()
   userid=userid
   cv2.imwrite('/var/www/html/img/'+userid+'.bmp',im)
   key = cv2.waitKey(10)
   cv2.destroyAllWindows()
   return 1


@app.route('/')
def index():
   log= logstat()
      #dat.append('myaccount')

   print log
   print session

   return render_template('index.html',log=log)


@app.route('/login')
def login():
##   if request.method == 'POST':
##   result = request.form
##   print result
   return render_template('login.html')

@app.route('/logincheck', methods = ['POST'])
def logincheck():
   if request.method == 'POST':
      result = request.form
      userid,password=( str(result['username']), str(result['password']))
      print userid , password

      db = MySQLdb.connect(host="localhost",  # your host
                     user="root",       # username
                     passwd="root",     # password
                     db="resproj")   # name of the database

# Create a Cursor object to execute queries.
      cur = db.cursor()

# Select data from table using SQL query.
      cur.execute("select exists (select * from login where userid=%s and password=%s)", (userid,password))
      res=cur.fetchall()
      status=res[0][0]
      if (status==0):
         return render_template('login.html')
      elif (status==1):
         session['userid']=userid
         return redirect('/myaccount')


@app.route('/register',methods=['POST'])
def register():
##   if request.method == 'POST':
##   result = request.form
##   print result
   return render_template('register.html')


@app.route('/registercheck', methods = ['POST'])
def registercheck():
   if request.method == 'POST':
      result = request.form
      userid,password=( str(result['userid']), str(result['password']))
      name,email,address,phone=( str(result['name']), str(result['email']),str(result['address']), str(result['phone']))
      print userid , password
      print result
      print 'name,email,address,phone'
      print name,email,address,phone

      db = MySQLdb.connect(host="localhost",  # your host
                     user="root",       # username
                     passwd="root",     # password
                     db="resproj")   # name of the database
      t=takepic(userid)

# Create a Cursor object to execute queries.
      cur = db.cursor()
      im=userid+'.bmp'

      q=("INSERT into login values('%s','%s')"%(userid,password))
      print q
      cur.execute(q)

      p=("INSERT into users(userid,phone,email,address,name,picimg) values('%s',%s,'%s',' %s','%s','%s')"%(userid,phone,email,address,name,im))
      print p
      cur.execute(p)
      db.commit()
      db.close()
      session['userid']=userid
      return redirect('/myaccount')





@app.route('/myaccount', methods=['POST','GET'])
def myaccount():
   if(seslogcheck()==0):
      return redirect('/login')
   elif (seslogcheck()==1):
      return redirect('/account/profile')


@app.route('/logout')
def logout():
   session.pop('userid',None)
   return redirect('/')



@app.route('/account/myaccount/', methods=['POST','GET'])
def myaccount2():
   if(seslogcheck()==0):
      return redirect('/login')
   elif (seslogcheck()==1):
      return redirect('/account/profile')

@app.route('/myaccount/', methods=['POST','GET'])
def myaccount3():
   if(seslogcheck()==0):
      return redirect('/login')
   elif (seslogcheck()==1):
      return redirect('/account/profile')





@app.route('/account/profile',methods=['POST','GET'])
def profile():
   if(seslogcheck()==0):
      return redirect('/login')
   elif (seslogcheck()==1):

      userid=session['userid']
      db = MySQLdb.connect(host="localhost",  # your host
                        user="root",       # username
                        passwd="root",     # password
                        db="resproj")   # name of the database

   # Create a Cursor object to execute queries.
      cur = db.cursor()
      q=("SELECT name,phone,email,address,picimg from users where userid='%s'"%(userid))

   # Select data from table using SQL query.
      cur.execute(q)
      datares2=cur.fetchall()
      print datares2

      return render_template('profile.html',result=datares2)






@app.route('/account/dashboard',methods=['POST','GET'])
def dashboard():
   if(seslogcheck()==0):
      return redirect('/login')

   useridd=session['userid']
   db = MySQLdb.connect(host="localhost",  # your host
                        user="root",       # username
                        passwd="root",     # password
                        db="resproj")   # name of the database
   cur = db.cursor()

   q=("select orderid,foodname,foodprice,quantity,date_time, (foodprice*quantity)as tot from food s, orders o where s.foodid=o.foodid and o.userid='%s'"%(useridd))
   cur.execute(q)
   datares2=cur.fetchall()
   print datares2



   return render_template('dashboard.html',result=datares2)

@app.route('/dashboard/',methods=['POST','GET'])
def dashboard3():
   return redirect('/account/dashboard')

@app.route('/account/account/dashboard/',methods=['POST','GET'])
def dashboard2():
   return redirect('/account/dashboard')



@app.route('/account/submitnew',methods=['POST','GET'])
def submitnew():
   if(seslogcheck()==0):
      return redirect('/login')
   elif (seslogcheck()==1):
      return render_template('submitnew.html')

##@app.route('/account/myreviews',methods=['POST','GET'])
##def myreviews():
##   if(seslogcheck()==0):
##      return redirect('/login')
##   elif (seslogcheck()==1):
##      return render_template('myreviews.html')



@app.route('/restaurants',methods = ['GET'])
def restaurants():
   log= logstat()


   db = MySQLdb.connect(host="localhost",  # your host
                     user="root",       # username
                     passwd="root",     # password
                     db="resproj")   # name of the database

# Create a Cursor object to execute queries.
   cur = db.cursor()

# Select data from table using SQL query.
   cur.execute('SELECT r.restid,r.restname,r.restadd,r.minorder,r.deltime ,d.imgname FROM restuarants r, rest_details d where r.restid=d.restid')
   datares2=cur.fetchall()
   print datares2
   dataresl=[]


   for dat in datares2 :
      restid=dat[0]
      data=list(dat)
      f= ("select count(rating),avg(rating) from reviews where restid=%s;"%(restid))
      cur.execute(f)
      rest_data=cur.fetchall()
      data.append(rest_data[0][0])
      data.append(rest_data[0][1])
      dataresl.append(tuple(data))
      print rest_data
      print data


   dataresl=tuple(dataresl)
   print dataresl

   return render_template("cold.html",result = dataresl,log=log)



@app.route('/restaurants/',methods = ['GET'])
def restaurants2():
   return redirect('/restaurants')


@app.route('/restaurants/search',methods = ['GET'])
def restaurantsearch():
   if request.method == 'GET':
      getr = request.args
      cat= str(getr['product_cat'])
      deliv= getr['delivery-type']
      print type(cat) , deliv
      print type(deliv)

   db = MySQLdb.connect(host="localhost",  # your host
                     user="root",       # username
                     passwd="root",     # password
                     db="resproj")   # name of the database

# Create a Cursor object to execute queries.
   cur = db.cursor()

# Select data from table using SQL query.
   q=("SELECT r.restid,r.restname,r.restadd,r.minorder,r.deltime, d.imgname FROM restuarants r , rest_details d where r.restid=d.restid and delpick = %s and %s = 1"%(deliv,cat))
   cur.execute(q)
   #print q
   datares2=cur.fetchall()
   #print datares2
   dataresl=[]


   for dat in datares2 :
      restid=dat[0]
      data=list(dat)
      f= ("select count(rating),avg(rating) from reviews where restid=%s;"%(restid))
      cur.execute(f)
      rest_data=cur.fetchall()
      data.append(rest_data[0][0])
      data.append(rest_data[0][1])
      dataresl.append(tuple(data))
      print rest_data
      print data


   dataresl=tuple(dataresl)
   print dataresl


   return render_template("cold.html",result = dataresl)




@app.route('/gp',methods = ['GET'])
def result():
   log= logstat()
   if request.method == 'GET':
      getr = request.args
      address= getr['location']
      print address




   db = MySQLdb.connect(host="localhost",  # your host
                     user="root",       # username
                     passwd="root",     # password
                     db="resproj")   # name of the database

# Create a Cursor object to execute queries.
   cur = db.cursor()

# Select data from table using SQL query.
   cur.execute('SELECT r.restid,r.restname,r.restadd,r.minorder,r.deltime, d.imgname FROM restuarants r , rest_details d where r.restid=d.restid and r.restadd= %s ',(address,))
   datares2=cur.fetchall()
   print datares2
   dataresl=[]


   for dat in datares2 :
      restid=dat[0]
      data=list(dat)
      f= ("select count(rating),avg(rating) from reviews where restid=%s;"%(restid))
      cur.execute(f)
      rest_data=cur.fetchall()
      data.append(rest_data[0][0])
      data.append(rest_data[0][1])
      dataresl.append(tuple(data))
      print rest_data
      print data


   dataresl=tuple(dataresl)
   print dataresl


   return render_template("cold.html",result = dataresl,log=log)




@app.route('/food',methods = ['GET'])
def food():
   log= logstat()


   db = MySQLdb.connect(host="localhost",  # your host
                     user="root",       # username
                     passwd="root",     # password
                     db="resproj")   # name of the database
# Create a Cursor object to execute queries.
   cur = db.cursor()

# Select data from table using SQL query.
   cur.execute('SELECT foodid,foodname,foodprice,foodimg FROM food')
   datares2=cur.fetchall()
   print datares2

   return render_template("food.html",result = datares2,log=log)

@app.route('/food/',methods = ['GET'])
def food2():
   return redirect('/food')


@app.route('/food/search',methods = ['GET'])
def foodsearch():
   if request.method == 'GET':
      getr = request.args
      cat= str(getr['product_cat'])
      deliv= getr['delivery-type']
      print type(cat) , deliv
      print type(deliv)

   db = MySQLdb.connect(host="localhost",  # your host
                     user="root",       # username
                     passwd="root",     # password
                     db="resproj")   # name of the database

# Create a Cursor object to execute queries.
   cur = db.cursor()

# Select data from table using SQL query.
   q=("SELECT f.foodid,f.foodname,f.foodprice,f.foodimg FROM food f , restuarants r where f.restid=r.restid and delpick = %s and foodcat= %s"%(deliv,cat))
   cur.execute(q)
   #print q
   datares2=cur.fetchall()
   #print datares2

   return render_template("food.html",result = datares2)








@app.route('/review',methods = ['GET'])
def review():
   if request.method == 'GET':
      getr = request.args
      restid= str(getr['rid'])




   data=[]
   datares=[]



   db = MySQLdb.connect(host="localhost",  # your host
                     user="root",       # username
                     passwd="root",     # password
                     db="resproj")
   cur = db.cursor()


   q=("SELECT restname from restuarants where restid=%s"%(restid))
   print q

   cur.execute(q)
   datares2=cur.fetchall()

   data.append(datares2[0][0])
   data.append(restid)

   data=tuple(data)
   datares.append(data)
   datares2=tuple(datares)

   return render_template('review.html',result=datares2)




@app.route('/postreview',methods = ['GET'])
def postreview():
   if request.method == 'GET':
      getr = request.args
      restid= str(getr['restid'])
      rating= getr['rating']
      rev=getr['comment']
      ts=time.time()
      st = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')

      print restid , st
      print rev

      db = MySQLdb.connect(host="localhost",  # your host
                     user="root",       # username
                     passwd="root",     # password
                     db="resproj")   # name of the database
      cur = db.cursor()
      userid=session['userid']

      q=("INSERT into reviews(restid,userid,review,rating,date_time) values(%s,'%s','%s',%s,'%s')"%(restid,userid,rev,rating[1],st))
      print q
      cur.execute(q)
      db.commit()
      db.close()

      return redirect('/account/myreviews')













@app.route('/account/myreviews',methods=['POST','GET'])
def myreviews():
   if(seslogcheck()==0):
      return redirect('/login')
   elif (seslogcheck()==1):

      db = MySQLdb.connect(host="localhost",  # your host
                     user="root",       # username
                     passwd="root",     # password
                     db="resproj")   # name of the database
      cur = db.cursor()
      userid=session['userid']

      q=("SELECT r.restname, w.review, w.date_time , w.rating from restuarants r, reviews w where r.restid=w.restid and w.userid='%s'"%(userid))
      print q

# Select data from table using SQL query.

      cur.execute(q)
      datares2=cur.fetchall()
      print datares2


      return render_template('myreviews.html',result=datares2)


@app.route('/addcart', methods = ['POST'])
def addcart():
   if(seslogcheck()==0):
      return redirect('/login')

   if request.method == 'POST':
      result = request.form
      print result
      foodid=result['foodid']

      db = MySQLdb.connect(host="localhost",  # your host
                        user="root",       # username
                        passwd="root",     # password
                        db="resproj")   # name of the database
      cur = db.cursor()

      userid=session['userid']

      tablename=userid+'cart'
      try:
         print 'tryerror'
         q=("select * from %s "%(tablename))
         cur.execute(q)
         datares2=cur.fetchall()

      except:
         q=("CREATE TABLE %s(foodid INT NOT NULL PRIMARY KEY,quantity INT NOT NULL,date_time DATETIME NOT NULL,CONSTRAINT FOREIGN KEY (foodid) REFERENCES food(foodid) ON DELETE CASCADE)"%(tablename))
         print q
         cur.execute(q)
         db.commit()

      q=("SELECT * from %s where foodid=%s"%(tablename, foodid))
      cur.execute(q)
      datares3=cur.fetchall()
      if len(datares3)==0:
         ts=time.time()
         st = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')
         q=("INSERT INTO %s VALUES(%s,1,'%s')"%(tablename, foodid, st))
         cur.execute(q)
         datares4=cur.fetchall()
         db.commit()
      else:
         quantity = datares3[0][1]
         print quantity
         q=("UPDATE %s SET quantity=%s WHERE foodid=%s"%(tablename, str(int(quantity)+1), foodid))
         cur.execute(q)
         datares5=cur.fetchall()
         db.commit()



         datares2=cur.fetchall()


   return redirect('/food')





@app.route('/mycart', methods = ['POST','GET'])
def cart():
   if(seslogcheck()==0):
      return redirect('/login')

   userid=session['userid']
   db = MySQLdb.connect(host="localhost",  # your host
                        user="root",       # username
                        passwd="root",     # password
                        db="resproj")
   # name of the database
   try:

      tablename=userid+'cart'
      cur = db.cursor()
      q=("select f.foodname,f.foodprice,t.quantity,f.foodimg, (quantity*foodprice) as tot from %s t, food f where f.foodid=t.foodid"%(tablename))
      cur.execute(q)
      datares2=cur.fetchall()
      print datares2
      tot=0
      for dat in datares2:
         tot=tot+dat[4]
      print tot
      return render_template('cart.html',result=datares2,tot=tot)
   except:
      return redirect('/food')






@app.route('/mycart/', methods = ['POST','GET'])
def cart2():

   return redirect('/mycart')



@app.route('/checkout', methods = ['POST','GET'])
def checkout():
   if(seslogcheck()==0):
      return redirect('/login')

   useridd=session['userid']
   db = MySQLdb.connect(host="localhost",  # your host
                        user="root",       # username
                        passwd="root",     # password
                        db="resproj")   # name of the database
   tablename=useridd+'cart'
   cur = db.cursor()
   ts=time.time()
   st = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')

   q=("select * from %s "%(tablename))
   cur.execute(q)
   datares2=cur.fetchall()

   print datares2
   for dat in datares2:
      foodid,quantity=(dat[0],dat[1])
      print foodid,quantity
      p="insert into orders(userid,foodid,quantity,date_time) values('%s',%s,%s,'%s')"%(useridd,foodid,quantity,st)
      print p
      cur.execute(p)
      db.commit()

   d=("drop table %s"%(tablename))
   print d
   cur.execute(d)
   db.commit()

   return redirect('/dashboard')



if __name__ == '__main__':
   app.run(host='127.0.0.1',debug = True, port=5000)
