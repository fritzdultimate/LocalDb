# LocalDb

## What is LocalDb?
LocalDb is a Javascript library created with LocalStorage, it is created to make LocalStorage more effecient in handling and storing data. It can work as a database to hold your data.
You can create tables, columns, perform some basic CRUD actions.

#### Initialization

```JAVASCRIPT
const db = new LocalDb('Blogger');
```
This will initialize your library creating a new database with the name provided i.e "Blogger"

#### Creating tables and columns
```JAVASCRIPT
db.create('blog_posts', 'id', {
  name:'id',
  type:'integer',
  }, {
  name:'title',
  type:'string',
  }, {
  name:'slug',
  type:'string',
  }, {
  name:'body',
  type:'string',
  }, {
  name:'poster',
  type:'string',
  }, {
  name:'created_on',
  type:'string',
  }, {
  name:'edited_on',
  type:'string',
  }, {
  name:'edited_posts',
  type:'string',
}
```
This command will create a table called "blog_posts" with id being the primary key.
The method `create()` accepts three to any number of parameter, where first parameter is the table name, the second parameter the primary key. Note that the second parameter must be present as a column. And other parameters as the column names and other properties.


#### Other methods
```JAVASCRIPT
db.from(table)
db.from(table).insert([...columns], [...values])
db.from(table).update([...columns], [...values])
db.from(table).delete([...columns]).where(where_clause)
db.from(table).delete([...columns]).like(wild_card)
db.from(table).select(["*"]).where(where_clause).orderBy(column_name).getAll() //selects all columns, the orderBy() method is optional
db.from(table).select(["*"]).where(where_clause).orderBy(column_name).getFirst() //selects all columns, the orderBy() method is optional
db.from(table).select(["*"]).where(where_clause).orderBy(column_name).getLast() //selects all columns, the orderBy() method is optional

db.from(table).select([...column_names]).where(where_clause).orderBy(column_name).getAll() //selects the given column(s), the orderBy() method is optional. the getAll() method can be replaced with either getFirst() or getLast()

```
