const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
    value: String,
    doneAt: Date,
    order: Number
});



// 몽고DB에서 지원하는 _id값을 쓰겠습니다.
// 그런데 이거는 위의 TodoSchema에서 사용하면 오류가 납니다.
// 따라서 사용하려면 virtualSchema로 선언해주셔야 사용할 수 있습니다.
// toHexString까지 사용해야지 _id값을 사용할 수 있습니다. 

TodoSchema.virtual('todoId').get(function () {
    return this._id.toHexString();
})

// TodoSchema가 JSON형태로 변환될 때 virtualSchema 기능을 포함한다 라고 선언해주어야 합니다.
TodoSchema.set('toJSON', {
    virtuals: true
})

// 모듈 내보내기
module.exports = mongoose.model('Todo', TodoSchema);