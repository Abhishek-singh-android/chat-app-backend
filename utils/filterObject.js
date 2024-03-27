
const filterObj = (obj,...allowedFields) =>{
    // this is going to create new empty object 
    const newObj={};
    //then we will use Object class and we apply key property on it then we will pass obj on it that we got as argument then this is basically creates new object with just the keys or basically an array
    //then we are going to loop over it so for all the keys that will be there in the req.body we will write the condition here    
    Object.keys(obj).forEach((el)=>{
        // the condition is if the allowed fields includes this particular key that we are getting one by one as an element and in that case we want to add that in newObj
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}

module.exports = filterObj;