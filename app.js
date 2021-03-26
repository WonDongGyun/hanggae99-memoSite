const express = require("express");

// body parser는 post request data의 body부분으로부터 파라미터를 편리하게 추출할 수 있다.
// 하지만 express에는 어차피 body parser가 존재하기 때문에 따로 import 하지 않아도 된다.
// 여기 예제에서는 그래도 사용한 듯 하다.
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const Todo = require('./models/todo');

mongoose.connect("mongodb://localhost/todo-demo", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const app = express();
const router = express.Router();



router.get("/", (req, res) => {
    res.send("Hi!");
});

router.get('/todos', async (req, res) => {
    const todos = await Todo.find().sort('-order').exec();

    res.send({ todos });
})


// 추가 기능
router.post('/todos', async (req, res) => {
    // { value }
    // destructoring => 구조분해 할당이라고 합니다.
    const { value } = req.body;
    const maxOrderTodo = await Todo.findOne().sort('-order').exec();
    let order = 1;

    if (maxOrderTodo) {
        order = maxOrderTodo.order + 1;
    }

    const todo = new Todo({ value, order });
    await todo.save();

    res.send({ todo });
})

// up down 기능, 내용 수정 기능, 체크박스 체크 및 해제 기능
router.patch('/todos/:todoId', async (req, res) => {
    const { todoId } = req.params;
    const { order, value, done } = req.body;

    const todo = await Todo.findById(todoId).exec();

    if (order) {
        const target = await Todo.findOne({ order }).exec();

        if (target) {
            target.order = todo.order;
            await target.save();
        }
        todo.order = order;
        await todo.save();
    }

    if (value) {
        await Todo.updateOne({ _id: todoId }, { $set: { value: value } })
    }

    if (done == true) {
        let today = new Date();
        await Todo.updateOne({ _id: todoId }, { $set: { doneAt: today } })
    } else {
        await Todo.updateOne({ _id: todoId }, { $set: { doneAt: '' } })
    }

    res.send({});
})

// 삭제 기능
router.delete('/todos/:todoId', async (req, res) => {
    const { todoId } = req.params;

    const todo = await Todo.findById(todoId).exec();

    if (todo) {
        await Todo.deleteOne({ _id: todoId }).exec();
        res.send({})
    }
})


// use() => 미들웨어 사용
// 앞으로 /api라는 경로로 요청이 들어와야만 middleware인 router를 사용할 수 있음.
app.use("/api", bodyParser.json(), router);
app.use(express.static("./assets"));


app.listen(8080, () => {
    console.log("서버가 켜졌어요!");
});