modules.exports.hotelsGetAll = function(req,res){
    console.log("GET the json");
        res
            .status(200)
            .json({"jsonData" : true});
}