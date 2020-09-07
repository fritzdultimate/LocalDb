/*
** Author:  Nwosu Darlington Chukwuemeka
** Copyright: 2020
** Copyright Note: This project is opened sourced and is available for both public and private use of non-profit projects. 
** Otherwise, the author should be informed.
** Version: v1.0.1
*/

function isPlainObject(obj) {
    return toString.call(obj) === '[object Object]'
}

function isPlainArray(obj) {
    return toString.call(obj) === '[object Array]'
}

function isInArray(array, search){
    for (let i = 0; i < array.length; i++) {
        if(array[i] == search){
            return true;
        }
    }
    return false
}

function isAllObject(obj){
    for (let i = 0; i < obj.length; i++) {
        if(!isPlainObject(obj[i])) {
            return false;
        }
    }
    return true;
}

function isAllArray(array){
    for (let i = 0; i < array.length; i++) {
        if(!isPlainArray(array[i])) {
            return false;
        }
    }
    return true;
}



function to_lc(str) {
    // console.log(str)
    if(Array.isArray(str)) {
        return str.map((el) => { 
            // (console.log(typeof el, el)); 
            return typeof el == 'number' ? el : el.toLowerCase()});
    }
    if(typeof str == 'number'){
        return str;
    }
    if(typeof str == 'string') {
        return str.toLowerCase();
    }
    return str;
}
            
class LocalDb {
    constructor(dbName) {
        this.$db = to_lc(dbName);
        if (localStorage.getItem(this.$db)) {
        } else {
            localStorage.setItem(this.$db, JSON.stringify({}));
        }
        this.affected_rows;
        Object.defineProperty(this, 'where', {
            value:function(where) {
                // console.log(where)
                this.where_clause = to_lc(where);
                return this;
            }
        });

        Object.defineProperty(this, 'isEmpty', {
            value : function(){
                for(let key in this) {
                    if (this.hasOwnProperty(key)) {
                        return false
                    }
                }
                return true;
            }
        });
        
        Object.defineProperty(this, 'like', {
            value:function(column, like, wildcard) {
                this.wildcard = wildcard == undefined ? 'both' : to_lc(wildcard);
                this.like_column = to_lc(column);
                this.like_search = to_lc(like);
                return this;
            }
        });

        Object.defineProperty(Array.prototype, 'getFirst', {
            value: function() {
                let db_object = typeof this[0] == 'string' ? JSON.parse(this[0]) : this;
                if(db_object.hasOwnProperty('db')) {
                    if(!db_object['results'].length) {
                        return db_object['results'];
                    }
                    return db_object['results'].splice(0, 1);
                }

                if(!db_object.length) {
                    return db_object;
                } 
                return db_object.splice(0, 1);
            }
        });

        Object.defineProperty(Array.prototype, 'getLast', {
            value: function() {
                let db_object = typeof this[0] == 'string' ? JSON.parse(this[0]) : this;
                if(db_object.hasOwnProperty('db')) {
                    if(!db_object['results'].length) {
                        return db_object['results'];
                    }
                    return db_object['results'].splice(-1, 1);
                }

                if(!db_object.length) {
                    return db_object;
                } 
                return db_object.splice(-1, 1);
            }
        });

        Object.defineProperty(Array.prototype, 'getAll', {
            value: function() {
                let db_object = typeof this[0] == 'string' ? JSON.parse(this[0]) : this;
                if(db_object.hasOwnProperty('db')) {
                    return db_object['results'];
                }

                return db_object;
            }
        });

        Object.defineProperty(Array.prototype, 'orderBy', {
            value: function(column, flag){
                flag = (flag == undefined) ? 'asc' : flag;
                flag = to_lc(flag);
                let db_object = JSON.parse(this[0]);
                let order_column = db_object['db'][column]['values'];
                if(!db_object['results'].length) {
                    return db_object['results'];
                }
                if(!column) {
                    throw new Error(`orderBy expexts atleast one argument!`);
                } else if(!db_object['db'].hasOwnProperty(to_lc(column))) {
                    throw new Error(`unknown column '${column}'`)
                } else if(!(flag == 'asc') && !(flag == 'desc')) {
                    throw new Error(`unsupported flag! '${flag}'`);
                }
                column = to_lc(column);
                let sort_return_val_g = flag == 'asc' ? 1 : -1;
                let sort_return_val_l = flag == 'desc' ? 1 : -1;
                let mapped = order_column.map((el, i) => {

                        return {index : i, value: to_lc(el)}
                    })
                
                mapped.sort((a, b) => {
                    if(a.value > b.value) {
                        return sort_return_val_g;
                    }
                    if(a.value < b.value) {
                        return sort_return_val_l;
                    }
                    return 0;
                })

                let result = mapped.map((el) => {
                    return db_object['results'][el.index]
                })
                result  = result.filter(el => el != undefined);
                return result;
                
                
            }
        })
    }

    from(table) {
        if(!table) {
            throw new Error(`table() expects a table name.`);
        } else if(typeof table != 'string') {
            throw new Error(`table's name must be a string.`);
        }

        let db = localStorage.getItem(this.$db);
        db = JSON.parse(db);
        this.tableName = to_lc(table);
        if(!db.hasOwnProperty(this.tableName)) {
            throw new Error(`unknown table name '${table}'`);
        }

        return this;
    }

    create(table, key, ...column) {
        if(!arguments.length) {
            throw new Error("table() expects atleast three arguements, 'table name, primary key, and array of column names or a string of one column name!");
        } else if(arguments.length < 3) {
            throw new Error("table() expects atleast three arguements, 'table name, primary key, and array of object names or a single object");
        } else if(isPlainObject(arguments[1]) || isPlainArray(arguments[1])) {
            throw new Error('There is an error in your query: primary key is expected as the second argument!')
        } else if(typeof table != 'string') {
            throw new Error("table's name must be a string!");
        } else if(typeof key != 'string') {
            throw new Error("primary key's name must be a string!");
        }
        let db = localStorage.getItem(this.$db);
        db = JSON.parse(db);
        this.tableName = table.toLowerCase();
        // Check if table already exists
        if(db.hasOwnProperty(this.tableName)){
            this.tableName = undefined;
            return true;
        }
        let attribute = (column.length == 1) ? column[0] : column;
        let these = this;
        key = to_lc(key);
        db[this.tableName] = {};

        // if only one column is present
        if(isPlainObject(attribute)) {
            // check object properties for right types and value
            if(!attribute.hasOwnProperty('name')) {
                throw new Error('There is an error in your query => column name not present');
            } else if(!attribute.hasOwnProperty('type')) {
                throw new Error('There is an error in your query => column type absent.');
            } else if(attribute.hasOwnProperty('type') &&  !isInArray(['int', 'integer', 'string', 'boolean', 'object'], attribute['type'])) {
                throw new Error(`There is an error in your query => the column type '${attribute['type']}' is not supported.`);
            } else if(key != to_lc(attribute['name'])) {
                throw new Error(`There is an error in your query => the primary key ${key} does not match any column name!`);
            } else if(!isInArray(['int', 'integer'], to_lc(attribute['type']))) {
                throw new Error("There is an error in your query => a primary key must be of type 'int or integer'");
            } else {
                attribute['name'] = to_lc(attribute['name']);
                db[this.tableName]['key'] = to_lc(key);
                db[this.tableName]['lastid'] = 0;
                let defaultValue = attribute.hasOwnProperty('default') ? attribute['default'] : null;
                attribute['default'] = defaultValue;
                attribute['value'] = [];
                db[this.tableName][to_lc(attribute['name'])] = attribute;
                localStorage.setItem(this.$db, JSON.stringify(db));
            }
            this.tableName = undefined;
            return true;

            // if more than one column is present...
        } else if(isPlainArray(attribute)){
            let columnNames = [];
            // attribute.forEach((element, index, array) => {
                for(let i = 0; i < attribute.length; i++){
                    columnNames.push(to_lc(attribute[i]['name']));
                }
                // if primary key does not match any column
                if(!isInArray(columnNames, key)) {
                throw new Error(`There is an error in your query => the primary key ${key} does not match any column name!`);
            } else {
                attribute.forEach((element, index) => {
                    if(db[this.tableName].hasOwnProperty(to_lc(element['name']))) {
                        throw new Error(`There is an error in your query => column ${element['name']} already exist!`);
                    } else if(!isInArray(['int', 'integer', 'string', 'boolean', 'object'], to_lc(element['type']))) {
                        throw new Error(`There is an error in your query => the column type '${element['type']}' is not supported.`);
                    } else if(!element.hasOwnProperty('name')) {
                        throw new Error(`There is an error in your query => column name not present.`);
                    } else if(!element.hasOwnProperty('type')) {
                        throw new Error(`There is an error in your query => column type absent.`);
                    } else if(key == to_lc(element['name']) && !isInArray(['int', 'integer'], to_lc(element['type']))) {
                        throw new Error(`There is an error in your query => a primary key must be of type 'int or integer'`);
                     } else {
                         if(to_lc(element['name']) == key) {
                            db[this.tableName]['key'] = key;
                         }
                        element['name'] = to_lc(element['name']);
                         let defaultValue = element.hasOwnProperty('default') ? element['default'] : null;
                        element['default'] = defaultValue;
                        element['values'] = [];
                         
                        db[this.tableName][to_lc(element['name'])] = element;
                     }
                });
                
            }
        }
        db[this.tableName]['lastid'] = 0;
        localStorage.setItem(this.$db, JSON.stringify(db));
        this.tableName = undefined;
        return true;

    }

    // Insert Data....
    insert(columnNames, values) {
        if(!arguments.length) {
            throw new Error("There is an error in your query => 'insert()' expects atleast two arguments, zero given.");
        }  else if(arguments.length < 2) {
            throw new Error("insert() expects atleast two arguements, an array of column and an array of values'");
        } else if(!isAllArray([columnNames, values])) {
            throw new Error("column names and values must be an array")
        } else if(this.tableName == undefined) {
            throw new Error(`table name not set, a call to 'from()' is expected`)
        }
        
        let db = localStorage.getItem(this.$db);
        db = JSON.parse(db);
        let key = db[this.tableName]['key'];
        let these = this;
        let lastid = db[this.tableName]['lastid'];
        if(columnNames.length != values.length) {
            throw new Error(`column names must match number of values specified`);
        }

        if(!columnNames.length || !values.length){
            throw new Error('column names or values cannot be empty!')
        }

        columnNames.forEach((el, i, a) => {
            el = to_lc(el);
            if(!db[this.tableName].hasOwnProperty(el)) {
                throw new Error(`invalid column name '${el}'`);
            } else {
                let columnType = db[this.tableName][el]['type'];
                let type = isInArray(['int', 'integer'], columnType) ? 'number' : columnType;
                if(typeof values[i] != type) {
                    throw new Error(`column type '${type}' does not match value type '${typeof values[i]}'`);
                }

                if(el == key) {
                    throw new Error(`you can't insert into a primary key`)
                }
                db[this.tableName][el]['values'].push(values[i]);
            }
            if(a.length == i+1) {
                db[this.tableName][key]['values'].push(lastid);

            }
        });
        // Check for unspecified columns...
        for (let prop in db[this.tableName]) {
        
            if(!isPlainObject(db[this.tableName][prop])) {
                continue;
                }
            if(isInArray(to_lc([...columnNames, key]), prop)) {
                continue;
            } else {
                // Check if default values match type
                let type = db[this.tableName][prop]['type'];
                    if (typeof db[this.tableName][prop]['default'] == 'object') {
                type = db[this.tableName][prop]['type']
                type = isInArray(['int', 'integer'], type) ? 'number' : type;
                }
                type = isInArray(['int', 'integer'], type) ? 'number' : type;

                if (typeof db[this.tableName][prop]['default'] != type && db[this.tableName][prop]['default'] != null) {
                    throw new Error('Default value type must match your column type hint!')
                }
                
                // Add default values to columns with no passed values
                let defaultValue = db[this.tableName][prop]['default'];
                db[this.tableName][prop]['values'].push(defaultValue);
            }
            
        }
        // end check for unspecified columns...
        lastid++
        db[this.tableName]['lastid'] = lastid;
        localStorage.setItem(this.$db, JSON.stringify(db));
        this.tableName = undefined;
    }
    // end insert

    // begin update
    update(columnNames, values) {
        this.affected_rows = 0;
        if(!arguments.length){
            throw new Error("There is an error in your query => 'update()' expects atleast two arguments, zero given.");
        }  else if(arguments.length < 2) {
            throw new Error("update() expects atleast three arguements, an array of column and an array of values'");
        } else if(!isAllArray([columnNames, values])) {
            throw new Error("column names and values must be an array")
        } else if(this.tableName == undefined) {
            throw new Error(`table name not set, a call to 'from()' is expected`)
        }
        
        let db = localStorage.getItem(this.$db);
        db = JSON.parse(db);
        let columns = db[this.tableName]
        columnNames = to_lc(columnNames);
        let these = this;
        if(columnNames.length != values.length) {
            throw new Error(`column names must match number of values specified`);
        } else if(!columnNames.length || !values.length){
            throw new Error('column names or values cannot be empty!')
        }

        // let's update the table...:D
        if(!this.where_clause) {
            if(!this.like_column) {
                // update the whole column and show warning on console...
                columnNames.forEach((el, inx) => {
                    let columnType = db[this.tableName][el]['type'];
                    let type = isInArray(['int', 'integer'], columnType) ? 'number' : columnType;
                    if(!db[this.tableName].hasOwnProperty(el)) {
                        throw new Error(`unknown column name '${el}`)
                    } else if(typeof values[inx] != type) {
                        throw new Error(`value '${values[inx]}' does not match column type '${db[this.tableName][el]["type"]}'`);
                    } else {
                        // update columes....
                        db[this.tableName][el]['values'].forEach((e, i) => {
                            db[this.tableName][el]['values'][i] = values[inx];
                        })
                    }
                    this.affected_rows = db[this.tableName][el]['values'].length;
                });
                console.warn(`Updating a table without a where clause will update every row of the matched column with the provided value!`);
                localStorage.setItem(this.$db, JSON.stringify(db));
                this.tableName = undefined;
                return true;
            } else {
                // if wildcard method is called...
                if(!db[this.tableName].hasOwnProperty(this.like_column)) {
                    throw new Error(`search column '${like_column}' does not exist in your table!`);
                } else {
                    let updateIndex = [];
                    db[this.tableName][this.like_column]['values'].forEach((el, ind) => {
                        if(this.wildcard == 'left') {
                            if(`${to_lc(el)}`.startsWith(this.like_search)) {
                                updateIndex.push(ind);
                            }
                        } else if(this.wildcard == 'right') {
                            if(`${to_lc(el)}`.endsWith(this.like_search)) {
                                updateIndex.push(ind);
                            }
                        } else if(this.wildcard == 'both') {
                            if(`${to_lc(el)}`.startsWith(this.like_search) && `${el}`.endsWith(this.like_search)) {
                                updateIndex.push(ind);
                            }
                        } else {
                            throw new Error(`invalid wildcard, expects either 'left, right or both', '${this.wildcard}' provided!`);
                        }
                    })
                    this.affected_rows = updateIndex.length
                    columnNames.forEach((el, inx) => {
                        if(!db[this.tableName].hasOwnProperty(el)) {
                            throw new Error(` unknown column name '${el}'`)
                        } else {
                            updateIndex.forEach((elem, ind) => {
                                db[this.tableName][el]['values'][elem] = values[inx];
                            })
                        }
                    })
                }
            }
            this.like_column = undefined;
            this.tableName = undefined;
            if(this.affected_rows) {
                localStorage.setItem(this.$db, JSON.stringify(db));
                return true
            }
            return false;
        } else {
            // update columns using where clause
            if(!this.like_column) {
                // update columns using only where clause
                if(!this.where_clause.length) {
                    throw new Error(`invalid where clause!`);
                } else if(!isPlainArray(this.where_clause)) {
                    throw new Error(`where clause expects an array!`)
                } else if(this.where_clause.length < 2) {
                    throw new Error(`'where expects atleast two arguments!'`)
                } else {
                    let col = this.where_clause[0];
                let match_value = this.where_clause[2];
                let operator = this.where_clause[1];
                if(this.where_clause.length == 2) {
                    operator = '';
                    let __char = [this.where_clause[1][0], this.where_clause[1][1]];
                    match_value = `${this.where_clause[1]}`.split('');
                    if(!db[this.tableName].hasOwnProperty(col)) {
                        throw new Error(`unknown column in your where clause! ${col}`);
                    }
                    let op = 0;
                    while(op < 3) {
                        if(isInArray(['!', '>', '<', '='], __char[op])) {
                            operator += __char[op];
                            match_value.splice(0,1);
                            op++;
                            continue;
                        }
                        op++;
                    }
                    match_value = match_value.join('');

                    operator = operator == '' ? '==' : operator;
                    operator = operator == '=' ? '==' : operator;
                }
                    match_value = to_lc(match_value);
                    let updateIndex = [];
                    db[this.tableName][to_lc(col)]['values'].forEach((el, ind) => {
                        if(eval(`${'el'}` + operator  + `${'match_value'}`)) {
                            updateIndex.push(ind);
                        }
                    })
                    this.affected_rows = updateIndex.length;
                    columnNames.forEach((elem, inx) => {
                        if(!db[this.tableName].hasOwnProperty(elem)) {
                            throw new Error('invalid column name');
                        } else {
                            let columnType = columns[elem]['type'];
                            let type = isInArray(['int', 'integer'], columnType) ? 'number' : columnType;
                            if(typeof values[inx] != type) {
                                throw new Error(`column type does not match value type`);
                            } else if(elem == db[this.tableName]['key']) {
                                throw new Error('updating a primary key failed');
                            } else {
                                db[this.tableName][elem]['values'].forEach((e, i) => {
                                    updateIndex.forEach((el, ind) => {
                                        if(el == i) {
                                            db[this.tableName][elem]['values'][el] = values[inx];
                                        }
                                    });
                                });
                            
                            }
                        }
                    });
                }
                this.where_clause = undefined;
                this.tableName = undefined;
                if(this.affected_rows) {
                    localStorage.setItem(this.$db, JSON.stringify(db));
                    return true;
                } else {
                    return false;
                }
            }
        }
    }
    // end update

    delete(table) {
        this.affected_rows = 0;
        if(this.tableName == undefined) {
            throw new Error(`table name not set, a call to 'from()' is expected`)
        }
        
        let db = localStorage.getItem(this.$db);
        db = JSON.parse(db);
        let these = this;

        // let's delete from the table... :D
        if(!this.where_clause) {
            if(!this.like_column) {
                // delete the whole column and show warning on console...
                for(let prop in db[this.tableName] ) {
                    if(!isPlainObject(db[this.tableName][prop])) {
                        continue;
                    } else {
                        // delete values from columes....
                        db[this.tableName][prop]['values'] = [];
                        this.affected_rows++;
                    }
                }
                console.warn(`Deleting a table without a where clause will delete every row in the table!`);
                this.tableName = undefined;
                if(this.affected_rows) {
                    localStorage.setItem(this.$db, JSON.stringify(db));
                    return true;
                }
                return false;
            } else {
                // if wildcard method is called...
                if(!db[this.tableName].hasOwnProperty(this.like_column)) {
                    throw new Error(`search column '${this.like_column}' does not exist in your table!`);
                } else {
                    for(let prop in db[this.tableName]) {
                        if(!isPlainObject(db[this.tableName][prop])) {
                            continue
                        } else {
                            let deleteIndex = [];
                            if(prop == this.like_column) {
                                db[this.tableName][prop]['values'].forEach((el, ind) => {
                                    if(this.wildcard == 'left' && `${el}`.startsWith(this.like_search)) {
                                        deleteIndex.push(ind);
                                    } else if (this.wildcard == 'right' && `${el}`.endsWith(this.like_search)) {
                                        deleteIndex.push(ind);
                                    } else if (this.wildcard == 'both' && (`${el}`.startsWith(this.like_search) && `${el}`.endsWith(this.like_search))) {
                                        deleteIndex.push(ind);
                                    }
                                });
                                this.affected_rows = deleteIndex.length;
                                if(this.wildcard == 'left') {
                                    if(deleteIndex.length) {
                                        let d = [...deleteIndex]
                                        for (let elem in db[this.tableName]) {
                                            if(!isPlainObject(db[this.tableName][elem])) {
                                                continue;
                                            } else {
                                                d.forEach((el, ind) => {
                                                if(ind > 0) {
                                                d = d.map((e) => {
                                                    return e - 1;
                                                    })
                                                }
                                                    db[this.tableName][elem]['values'].splice(d[ind], 1);
                                                });
                                                d = [...deleteIndex];
                                                
                                            }
                                        }
                                        
                                    }
                                    
                                } else if(this.wildcard == 'right') {
                                    if(deleteIndex.length) {
                                        let d = [...deleteIndex]
                                        for (let elem in db[this.tableName]) {
                                            if(!isPlainObject(db[this.tableName][elem])) {
                                                continue;
                                            } else {
                                                d.forEach((el, ind) => {
                                                if(ind > 0) {
                                                d = d.map((e) => {
                                                    return e - 1;
                                                    })
                                                }
                                                    db[this.tableName][elem]['values'].splice(d[ind], 1);
                                                });
                                                d = [...deleteIndex];
                                                
                                            }
                                        }
                                        
                                    }
                                    
                                } else if(this.wildcard == 'both') {
                                    if(deleteIndex.length) {
                                        let d = [...deleteIndex]
                                        for (let elem in db[this.tableName]) {
                                            if(!isPlainObject(db[this.tableName][elem])) {
                                                continue;
                                            } else {
                                                d.forEach((el, ind) => {
                                                if(ind > 0) {
                                                d = d.map((e) => {
                                                    return e - 1;
                                                    })
                                                }
                                                    db[this.tableName][elem]['values'].splice(d[ind], 1);
                                                });
                                                d = [...deleteIndex];
                                                
                                            }
                                        }
                                        
                                    }

                                } else {
                                    throw new Error(`invalid wildcard, expects either 'left, right or both', '${this.wildcard}' provided!`);
                                }
                            }
                        }
                    }
                }
                this.like_column = undefined;
                this.tableName = undefined;
                if(this.affected_rows) {
                    localStorage.setItem(this.$db, JSON.stringify(db));
                    return true;
                }
                return false;
            }
        } else {
            // update columns using where clause
            if(!this.like_column) {
                // update columns using only where clause
                if(!this.where_clause.length) {
                    throw new Error(`invalid where clause!`);
                } else if(!isPlainArray(this.where_clause)) {
                    throw new Error(`where clause expects an array!`)
                } else if(this.where_clause.length < 2) {
                    throw new Error(`'where expects atleast two arguments!'`)
                } else {
                    let col = this.where_clause[0];
                    let match_value = this.where_clause[2];
                    let operator = this.where_clause[1];
                    if(this.where_clause.length == 2) {
                        operator = '';
                        let __char = [this.where_clause[1][0], this.where_clause[1][1]];
                        match_value = `${this.where_clause[1]}`.split('');
                        if(!db[this.tableName].hasOwnProperty(col)) {
                            throw new Error(`unknown column in your where clause!`);
                        }
                        let op = 0;
                        while(op < 3) {
                            if(isInArray(['!', '>', '<', '='], __char[op])) {
                                operator += __char[op];
                                match_value.splice(0,1);
                                op++;
                                continue;
                            }
                            op++;
                        }
                        match_value = match_value.join('');

                        operator = operator == '' ? '==' : operator;
                        operator = operator == '=' ? '==' : operator;
                    }
                    let deleteIndex = []
                    db[this.tableName][to_lc(col)]['values'].forEach((el, ind) => {
                        if(eval(`${'el'}` + operator  + `${'match_value'}`)) {
                            deleteIndex.push(ind);
                            console.log(el, operator, match_value)
                        }
                    });
                    this.affected_rows = deleteIndex.length;
                    if(deleteIndex.length) {
                        let d = [...deleteIndex];
                        for(let prop in db[this.tableName]) {
                            if(!isPlainObject(db[this.tableName][prop])) {
                                continue;
                            }
                            d.forEach((el, ind) => {
                                if(ind > 0) {
                                    d =  d.map((e) => {
                                        return e - 1;
                                    });
                                }
                                console.log(d)
                                db[this.tableName][prop]['values'].splice(d[ind], 1);
                            });
                            d = [...deleteIndex];
                        }
                        
                    }
                }
            }
            this.where_clause = undefined;
            this.tableName = undefined;
            if(this.affected_rows) {
                localStorage.setItem(this.$db, JSON.stringify(db));
                return true;
            }
            return false;
        }
    }

    select(columns) {
        if(!arguments.length){
            throw new Error("There is an error in your query => 'select()' expects an array columns.");
        } else if(!isPlainArray(columns)) {
            throw new Error(`second argument expects an array of column names`);
        } else if(!columns.length) {
            throw new Error(`no column name present.`);
        }
        
        let db = localStorage.getItem(this.$db);
        db = JSON.parse(db);
        let these = this;
        if(columns[0] == '*' && columns.length == 1) {
            columns = [];
            for(let prop in db[this.tableName]) {
                if(!isPlainObject(db[this.tableName][prop])) {
                    continue;
                }
                columns.push(prop);
            }
        }
        let result = [];
        let obj;
        let len = 0;
        let i = 0;

        if(!this.where_clause && !this.like_column) {
            columns.forEach((el, ind) => {
                if(!db[this.tableName].hasOwnProperty(el)) {
                    throw new Error(`unknown column name! ${el}`);
                }
                while (len < db[this.tableName][el]['values'].length) {
                    if(i) {
                        result[len][el] = db[this.tableName][el]['values'][len];
                        len++;
                    } else {
                        obj = {};
                        let item = db[this.tableName][el]['values'][len];
                        obj[el] = item;
                        result.push(obj);
                        len++
                    }
                }
                len = 0;
                i++;
            });
            let object = db[this.tableName];
            delete object['lastid'];
            delete object['key'];
            this.tableName = undefined;
            return [JSON.stringify({db:object, results:result})];

        } else if(this.where_clause) {
            if(!this.where_clause.length) {
                throw new Error(`invalid where clause!`);
            } else if(!isPlainArray(this.where_clause)) {
                throw new Error(`where clause expects an array!`)
            } else if(this.where_clause.length < 2) {
                throw new Error(`'where expects atleast two arguments!'`)
            } else {
                let col = this.where_clause[0];
                let match_value = this.where_clause[2];
                let operator = this.where_clause[1];
                if(this.where_clause.length == 2) {
                    operator = '';
                    let __char = [this.where_clause[1][0], this.where_clause[1][1]];
                    match_value = `${this.where_clause[1]}`.split('');
                    if(!db[this.tableName].hasOwnProperty(col)) {
                        throw new Error(`unknown column in your where clause! ${col}`);
                    }
                    let op = 0;
                    while(op < 3) {
                        if(isInArray(['>', '<', '=', '!'], __char[op])) {
                            operator += __char[op];
                            match_value.splice(0,1);
                            op++;
                            continue;
                        }
                        op++;
                    }
                    match_value = match_value.join('');

                    operator = operator == '' ? '==' : operator;
                    operator = operator == '=' ? '==' : operator;
                }
                let selectIndex = [];
                db[this.tableName][to_lc(col)]['values'].forEach((el, ind) => {
                    el = to_lc(el);
                    let el1 = JSON.stringify(el);
                    let el2 = JSON.stringify(match_value);
                    if(eval(`${el1}` + operator + `${el2}` )) {
                        selectIndex.push(ind)
                    }
                })
                if(selectIndex.length) {
                    columns.forEach((el, ind) => {
                        if(!db[this.tableName].hasOwnProperty(el)) {
                            throw new Error(`unknown column name! ${el}`);
                        }
                        
                        while (len < selectIndex.length) {
                            // if( db[this.tableName])
                            if(i) {
                                result[len][el] = db[this.tableName][el]['values'][selectIndex[len]];
                                len++;
                            } else {
                                obj = {};
                                let item = db[this.tableName][el]['values'][selectIndex[len]];
                                obj[el] = item;
                                result.push(obj);
                                len++
                            }
                        }
                        len = 0;
                        i++;
                    });
                }
            }
            // this.where_clause = undefined;
            let object = db[this.tableName];
            delete object['lastid'];
            delete object['key'];
            this.tableName = undefined;
            return [JSON.stringify({db:object, results:result})];

        } else if(this.like_column) {
            // if wildcard method is called...
            if(!db[this.tableName].hasOwnProperty(this.like_column)) {
                throw new Error(`search column '${this.like_column}' does not exist in your table!`);
            } else {
                for(let prop in db[this.tableName]) {
                    if(!isPlainObject(db[this.tableName][prop])) {
                        continue
                    } else {
                        let selectIndex = [];
                        if(prop == this.like_column) {
                            db[this.tableName][prop]['values'].forEach((el, ind) => {
                                if(this.wildcard == 'left' && `${el}`.startsWith(this.like_search)) {
                                    selectIndex.push(db[this.tableName][prop]['values'].indexOf(el))
                                } else if (this.wildcard == 'right' && `${el}`.endsWith(this.like_search)) {
                                    selectIndex.push(db[this.tableName][prop]['values'].indexOf(el))
                                } else if (this.wildcard == 'both' && (`${el}`.startsWith(this.like_search) && `${el}`.endsWith(this.like_search))) {
                                    selectIndex.push(db[this.tableName][prop]['values'].indexOf(el))
                                }
                            });

                            if(this.wildcard == 'left') {
                                if(selectIndex.length) {
                                    columns.forEach((el, ind) => {
                                        if(!db[this.tableName].hasOwnProperty(el)) {
                                            throw new Error(`unknown column name! ${el}`);
                                        }
                                        while (len < selectIndex.length) {
                                            if(i) {
                                                result[len][el] = db[this.tableName][el]['values'][selectIndex[len]];
                                                len++;
                                            } else {
                                                obj = {};
                                                let item = db[this.tableName][el]['values'][selectIndex[len]];
                                                obj[el] = item;
                                                result.push(obj);
                                                len++
                                            }
                                        }
                                        len = 0;
                                        i++;
                                    });
                                    let object = db[this.tableName];
                                    delete object['lastid'];
                                    delete object['key'];
                                    this.tableName = undefined;
                                    this.like_column = undefined;
                                    return [JSON.stringify({db:object, results:result})];
                                    
                                }
                                let object = db[this.tableName];
                                delete object['lastid'];
                                delete object['key'];
                                this.tableName = undefined;
                                this.like_column = undefined;
                                return [JSON.stringify({db:object, results:result})];
                                
                            } else if(this.wildcard == 'right') {
                                if(selectIndex.length) {
                                    columns.forEach((el, ind) => {
                                        if(!db[this.tableName].hasOwnProperty(el)) {
                                            throw new Error(`unknown column name! ${el}`);
                                        }
                                        while (len < selectIndex.length) {
                                            if(i) {
                                                result[len][el] = db[this.tableName][el]['values'][selectIndex[len]];
                                                len++;
                                            } else {
                                                obj = {};
                                                let item = db[this.tableName][el]['values'][selectIndex[len]];
                                                obj[el] = item;
                                                result.push(obj);
                                                len++
                                            }
                                        }
                                        len = 0;
                                        i++;
                                    });
                                    let object = db[this.tableName];
                                    delete object['lastid'];
                                    delete object['key'];
                                    this.tableName = undefined;
                                    this.like_column = undefined;
                                    return [JSON.stringify({db:object, results:result})];  
                                }
                                let object = db[this.tableName];
                                delete object['lastid'];
                                delete object['key'];
                                this.tableName = undefined;
                                this.like_column = undefined;
                                return [JSON.stringify({db:object, results:result})];

                            } else if(this.wildcard == 'both') {
                                if(selectIndex.length) {
                                    columns.forEach((el, ind) => {
                                        if(!db[this.tableName].hasOwnProperty(el)) {
                                            throw new Error(`unknown column name! ${el}`);
                                        }
                                        while (len < selectIndex.length) {
                                            if(i) {
                                                result[len][el] = db[this.tableName][el]['values'][selectIndex[len]];
                                                len++;
                                            } else {
                                                obj = {};
                                                let item = db[this.tableName][el]['values'][selectIndex[len]];
                                                obj[el] = item;
                                                result.push(obj);
                                                len++
                                            }
                                        }
                                        len = 0;
                                        i++;
                                    });
                                    let object = db[this.tableName];
                                    delete object['lastid'];
                                    delete object['key'];
                                    this.tableName = undefined;
                                    this.like_column = undefined;
                                    return [JSON.stringify({db:object, results:result})];
                                }
                                let object = db[this.tableName];
                                delete object['lastid'];
                                delete object['key'];
                                this.tableName = undefined;
                                this.like_column = undefined;
                                return [JSON.stringify({db:object, results:result})];
                            } else {
                                throw new Error(`invalid wildcard, expects either 'left, right or both', '${this.wildcard}' provided!`);
                            }
                        }
                    }
                }
            }
            this.like_column = undefined;
            let object = db[this.tableName];
            delete object['lastid'];
            delete object['key'];
            this.tableName = undefined;
            return [JSON.stringify({db:object, results:result})];;
        }
    }

    get dbObject() {
        return JSON.parse(localStorage.getItem(this.$db));
    }

}
