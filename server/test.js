import { ConnectDB } from "./config/db.config.js";
import { User } from "./models/user.model.js"

(async() => {
    ConnectDB();
    const user = await User.find({email: 'elmohtarftop@gmail.com'}).select('')
    console.log(user);
})()