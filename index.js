const express = require('express');

const app = express();

const fs = require('fs');

const joi = require('joi');

app.use(express.json());

const path = require('path');

let uniqueID = 0;

const pathToFile = path.join(__dirname, './userData.json');
const pathToFile2 = path.join(__dirname,'./file.txt');

const userSchema = joi.object({
    firstName: joi.string().min(1).required(),
    lastName: joi.string().min(1).required(),
    age: joi.number().min(0).max(150).required(),
    city: joi.string().min(1).required()
})


// Добавление данных пользователя в JSON-файл

app.post('/users', (req, res) => {
    console.log("что здесь происходит", req.body);
    uniqueID += 1;
    let newUser = {
        id: uniqueID, // к объeкту запроса добавили поле id
        ...req.body
    }
    console.log("данные пользователей", newUser);

    //throw new Error('Ошибка: детали превосходят все ожидания!');

    fs.readFile(pathToFile, 'utf8', (err, fileContents) => {
        if (err) throw err; // в случае ошибки останавливаем выполнение функции Post

        let jsonUserData = JSON.parse(fileContents);
        console.log("что было до",jsonUserData);
        jsonUserData.push(
            {
                 id: uniqueID,
                 ...req.body
            }
        );
        console.log("что происходит после",jsonUserData);
        const txt = "string";
        const callback = function(error){
            if(error){  // если ошибка
                return console.log(error);
            }
            console.log("Файл успешно записан");
        };
        fs.writeFile(pathToFile2, txt, callback);
            
        fs.writeFile(pathToFile, JSON.stringify(jsonUserData, null, 2), (err) => {
            if (err) throw err;
        });
        res.send(
            { 
                id: uniqueID 
            }
        );
    });
});

// Получение данных всех пользователей
    
app.get('/users', (req, res) => {
    fs.readFile(pathToFile, 'utf8', (err, fileContents) => {
        if (err) throw err; // в случае ошибки останавливаем выполнение функции Post

        let jsonUserData = JSON.parse(fileContents);
        console.log("что было до",jsonUserData);
        
    res.send(
        { 
            jsonUserData
        }
    );
    });
});

// Получение данных пользователя по ID

app.get('/users/:id', (req, res) => {
    
    let users = JSON.parse(fs.readFileSync(pathToFile,'utf-8'));
    const userId = +req.params.id;
    const user = users.find(user => user.id === userId);
    if (user) {
        res.send({ user });
    } else {
        res.status(404);
        res.send({ user: null });
    };
});


// Обновление данных пользователя

app.put('/users/:id', (req, res) => {
    const result = userSchema.validate(req.body);
    if (result.error) {
        return res.status(404).send({ error: result.error.details });
    };
   
    let users = JSON.parse(fs.readFileSync(pathToFile, 'utf-8'));
    const userId = +req.params.id; //+ это приведение к числу 
    const user = users.find(user => user.id === userId);
    if (user) {
        const { firstName, lastName, age, city } = req.body;
        user.firstName = firstName;
        user.lastName = lastName;
        user.age = age;
        user.city = city;

        fs.writeFileSync(pathToFile, JSON.stringify(users, null, 2));
        res.send({ user });
    } else {
        res.status(404);
        res.send({ user: null });
    };
});

// Удаление пользователя

app.delete('/users/:id', (req, res) => {
    let users = JSON.parse(fs.readFileSync(pathToFile,'utf-8'));
    const userId = +req.params.id;
    const user = users.find(user => user.id === userId);
    if (user) {
        const userIndex = users.indexOf(user);
        users.splice(userIndex, 1);

        fs.writeFileSync(pathToFile, JSON.stringify(users, null, 2));

        res.send({ user });
    } else {
        res.status(404);
        res.send({ user: null });
    };
});

app.listen(3000);