const { configDotenv } = require("dotenv");
const app = require("./app")
const mongoose = require("mongoose");

configDotenv({path:"./config.env"});

const {Server} = require("socket.io"); 


process.on("uncaughtException",(err)=>{
    console.log(err);
    process.exit(1);
});



const http = require("http");
const User = require("./models/user");
const FriendRequest = require("./models/friendRequest");
const path = require("path");

const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:"http://localhost:3000",
        methods:["GET","POST"]
    }
});

// here password comes from config.env file DBPASSWORD
const DB = process.env.DBURI.replace("<PASSWORD>",process.env.DBPASSWORD)

mongoose.connect(DB,{
    useNewUrlParser:true,
    // useCreateIndex:true,
    // useFindAndModify:false,
    useUnifiedTopology:true,
}).then((con)=>{
    console.log("DB connection is sucessful");
}).catch((error)=>{
    console.log(error);
})

const port = process.env.PORT || 8000;

server.listen(port,()=>{
    console.log(`App running on port ${port}`)
})

io.on("connection",async(socket)=>{
console.log(socket); 
console.log("Server.js Socket handsake : ",JSON.stringify(socket.handshake.query));   
const user_id = socket.handshake.query("user_id");
const socket_id = socket.id;
console.log("User connected: ",socket_id);

if(Boolean(user_id)){
    await User.findByIdAndUpdate(user_id,{socket_id,status:"Online"});
}

// we can write our socket event listener here 

socket.on("friend_request", async(data)=>{
    console.log(data.to);
    // {to:"76858"}

    const to_user = await User.findById(data.to).select("socket_id");
    const from_user = await User.findById(data.from).select("socket_id");

    // create a friend request
    await FriendRequest.create({
        sender:data.from,
        recipient:data.to,
    })
    
    // TODO: create a friend request
    // emit event => "new friend request"
    io.to(to_user.socket_id).emit("new_friend_request",{

        message:"New Friend Request Received"
    });

    // emit event => "request send"
    io.to(from_user.socket_id).emit("request_send",{
        message:"Request sent successfully!"
    })
});

socket.on("accept_request",async(data)=>{
console.log(data);

const request_doc = await FriendRequest.findById(data.request_id);
console.log(request_doc);

// 

const sender = await User.findById(request_doc.sender);
const receiver = await User.findById(request_doc.recipient);

sender.friends.push(request_doc.recipient);
receiver.friends.push(request_doc.sender)

await receiver.save({new:true,validateModifyOnly:true});
await sender.save({new:true,validateModifyOnly:true});

await FriendRequest.findByIdAndDelete(data.request_id);

io.to(sender.socket_id).emit("request_accepted",{
    message:"Friend Request Accepted"
})

io.to(receiver.socket_id).emit("request_accepted",{
    message:"Friend Request Accepted"
})


// handle text/link messages
socket.on("text_message", (data)=>{
    console.log("Received Message: ",data);

    // data: {to,from,text}

    // create a new conversation if it doesn't exist yet or add new message to the messages list

    // save to db

    // emit incoming message => to user

    // emit outgoing messages => from user

});

socket.on("file_message",(data)=>{
    console.log("Received Message: ",data)

    // data:{to,from,text,file}

    // get file extension
    const fileExtension = path.extname(data.file.name);

    // generate a unique filename
    const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}${fileExtension}`

    // upload file to AWS s3

     // create a new conversation if it doesn't exist yet or add new message to the messages list

    // save to db

    // emit incoming message => to user

    // emit outgoing messages => from user

})

socket.on("end",async(data)=>{
    // find user by id and set the status offline
    if(data.user_id){
        await User.findByIdAndUpdate(data.user_id,{status:"Offline"})
    }
    // TODO: broadcast user is disconnected

    console.log("closing connection")
    socket.disconnect(0);
})

})


})

process.on("unhandledRejection",(err)=>{
    console.log(err);
    server.close(()=>{
        process.exit(1);
    });
})