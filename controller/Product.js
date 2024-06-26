// Controller is made to control the collectioons like all crud operation would be performed here 
const { query } = require("express");
const {Product} = require("../model/Product");
// this exports. is old way or ES5 way to export the function , it means createProduct is exported
//In the mongoose , mongoose only accept the promises you can not write callback here but only write promises so you can use await if wish to ,because every functionality will behave as promise here .
// THese are basically api  
exports.createProduct= async(req,res)=>{
    //this req.body will get from the frontend ,basically whatever product we would have to sell they all will be added by the admin by frontend so that whole data would come from the frontend and we be parsed by the middleware express.json() because data would be in the form of json 
    const product = new Product(req.body)
    product.discountPrice = Math.round(product.price*(1-product.discountPercentage/100))
    try{
        const doc = await product.save()
        // Product.save is different from insert because if you will provide id to it so it will behave as update but if no id so it will work as normal insertion 
        res.status(201).json(doc)
    }catch(err){
        res.status(400).json(err)
    }
} 

exports.fetchAllProducts= async(req,res)=>{
    //this req.body will get from the frontend ,basically whatever product we would have to sell they all will be added by the admin by frontend so that whole data would come from the frontend and we be parsed by the middleware express.json() because data would be in the form of json 
    // here filter will come as object like //filter = {"category":["smartphones", "clothes"]}
    //sort ={_sort:"price",_order:"desc"}
    //pagination={_page:1 , _limit=10}
    let condition = {}
    if(!req.query.admin){
        condition.deleted = {$ne:true};
    }
    let  query = Product.find(condition);
    // those products whose deleted is false that product should be appeared in the user section only and those who are deleted they would be in the admin section so that when those product would be available so admin will again make it available 
    let  totalProductsQuery = Product.find(condition);
    // In Express. js, req. query is an object containing a set of key-value pairs representing the query parameters of the URL. This object is used to get the values of query parameters, which are appended to the end of the URL after a question mark.
    
    // i am applying all these filter on a same "query" variable because first of all , all products which are of category mentioned would come in it then , in those filter category brand would be choosen that which brand is needed so brand filter would be applied on that category if category was provided then sort would be app lied and also remember that these commands of dbms are promises so they wouuld be working in the background 
    if(req.query.category){
        // The  $in operator selects the documents where the value of a field equals any value in the specified array. so basically this split is creating a array from the array , now req.query.category has a array which are separated from the comma so here when you specify a array so comma should not be there so split is making a suitable array and split method separating the element from that array with the help of comma where a comma is availabe it means this is another element  , so that which ever category is in that array that document would be selected so this is for to select simultaneously more than one category at a time 
        query =  query.find({category: {$in:req.query.category.split(',')}});
        totalProductsQuery =  totalProductsQuery.find({category: {$in:req.query.category.split(',')}});
    }
    const totalDocs = await totalProductsQuery.count().exec();  
    if(req.query.brand){
        query =  query.find({brand: {$in:req.query.brand.split(',')}});
        totalProductsQuery =  totalProductsQuery.find({brand: {$in:req.query.brand.split(',')}});
    }
    if(req.query._sort && req.query._order){
        query =  query.sort({[req.query._sort]:req.query._order})

    }

    
    if(req.query._page && req.query._limit){
        const pageSize = req.query._limit;
        const page = req.query._page;
        query = query.skip(pageSize*(page-1)).limit(pageSize);
    }

    try{
        const doc = await query.exec()
        // console.log("this is doc"+ doc)
        // this is to set or make new field in header section because while using the json server we were using the X-total-count to get the total product ina particular page 
        // about clone it is in the notes.txt 
        // const totalDocs = await query.clone().count().exec();
       

        res.set('X-Total-Count',totalDocs);
        // Product.save is different from insert because if you will provide id to it so it will behave as update but if no id so it will work as normal insertion 
       
        res.status(200).json(doc)
    }catch(err){
        res.status(400).json(err)
    }
}
exports.fetchProductById = async (req,res)=>{
    const {id} =  req.params;
    // params give you the part you write after the url like if url is /product and you use like 
    // /product/2 so here 2 will come in the params 
    try{
        const doc = await Product.findById(id);
        res.status(200).json(doc)
    }catch(err){
        res.status(400).json(err)
    }
}

exports.updateProduct = async (req,res)=>{
    const {id} =  req.params;
    // params give you the part you write after the url like if url is /product and you use like 
    // /product/2 so here 2 will come in the params 
    try{
        // here basically in the req.body we will send the updated product and basically findByIdAndUpdate function send the old document not updated one so we ordered him new:true means send the updated document because we want updated product in our frontend
        const product = await Product.findByIdAndUpdate(id,req.body,{new:true});
        product.discountPrice = Math.round(product.price*(1-product.discountPercentage/100))
        const updatedProduct = await product.save();
        // in the findByIdAndUpdate you generally send only those field of the document which is to be updated 
        res.status(200).json(updatedProduct)
    }catch(err){
        res.status(400).json(err) 
    }
}