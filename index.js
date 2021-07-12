
const xlsx = require("xlsx");
const fetch = require("node-fetch");

const forbidSites = [                                   //<<<============== Modify this list to add filters on the resulting websites
                        "google"
                        ,".pdf"
                        ,"amazon"
                        ,"bbc"
                        ,"yahoo"
                        ,"bing"
                        ,"wikipedia"
                        ,"instagram"
                        ,"facebook"
                        ,"twitter"
                        ,"blog"
                        ,"linkedin"
                        ,"allforgood"
                        ,"angloinfo"
                        ,"arab.org"
                        ,"charitychoice"
                        ,"charitylibrary"
                        ,"edf"
                        ,"globalgiving"
                        ,"idealist"
                        ,"ivolunteer"
                        ,"mnhandsandvoices"
                        ,"ngobridges"
                        ,"qlife"
                        ,"rip.ie"
                        ,"rmhc"
                        ,"smeru"
                        ,"volunteeraustralia"
                        ,"volunteermatch"
                        ,"wango"
                        ,"globalhand"
                    ];
var city = ["mumbai"]; ///<<========Modify this list to add more cities

var country = "India"       ////<<<==========Modify this value to change country name

const api_key = `f0a9f187a54086e6f4b8fd9d173d86d7`;    


async function main(){
    for(let i of city){
        console.log("City Name: " + i);

        var queryList = [
            `voluntary organizations directory in ${i}, ${country}`
            ,`Nonprofits working for LGBTQ community based in ${i}, ${country}`
            ,`List of Volunteering oppertunity in Education sector based in ${i}, ${country}`
            ,`Non profits working towards Covid and vaccine hesitancy in ${i}, ${country}`
            ,`STEM voluntary organisations based in ${i}, ${country}`
            ,`Volunteer organisations working for homeless in ${i}, ${country}`
        ];
        //query = `voluntary organizations directory in ${i}, ${country}`;            ///<<===============Modify the query to search here

        for(let query of queryList){

            console.log('Query being searched: ' + query);
            let url =`http://api.serpstack.com/search?access_key=${api_key}&query=${query}&num=1000&images_page=0`;
            let json;
            try{
                let response = await fetch(url);
                json = await response.json();
                console.log(json.organic_results);
            }catch(err){
                console.log("*****ERROR*****",err);
            }

            const wb = xlsx.readFile("Google scrapping results.xlsx");
            var ws = wb.Sheets['Sheet1'];
            var data = xlsx.utils.sheet_to_json(ws);

            for(let j of json.organic_results){
                j.City = i;
                j.Country = country;
                data.push(j);
            }

            //creating a new field site_name for deleting duplicates

            for(let i=0;i<data.length;i++){
                data[i].site_name = "NA";
                var si = data[i].url.indexOf("www.")+4;
                var str;
                if(data[i].url.indexOf("www.") != -1){

                    str = data[i].url[si];
                    for(var lv = si+1;data[i].url[lv] != '.';lv++){
                        str = str + data[i].url[lv];
                    }

                    data[i].site_name = str;

                }else{
                    var si1 = data[i].url.indexOf("://")+3;
                    var str1;
                    if(data[i].url.indexOf("://") != -1){
                        str1 = data[i].url[si1];
                        for(var lv1 = si1+1;data[i].url[lv1] != '.';lv1++){
                            str1 = str1 + data[i].url[lv1];
                        }

                        data[i].site_name = str1;
                    }
                }

            }

            //Deleting Duplicates
            for(let i=0;i<data.length;i++){

                var temp = data[i].site_name;
                if(temp != "NA" && temp.length > 3 && temp != "instagram" && temp != "facebook" && temp != "twitter" && temp != "blog" && temp != "linkedin" && temp!= "linktr"){
                    for(let j=0;j<data.length;j++){
                        if(temp == data[j].site_name && i!=j){
                            data.splice(j,1);
                        }
                        
                    }
                }

            }

            // Removing forbid Websites
            for(let i=0;i<data.length;i++){
                var link = data[i].url;
                for(let site of forbidSites){
                    if(link.includes(site)){
                        console.log(site);
                        console.log(data.splice(i,1));
                        i--;
                        break; 
                    }
                }
            }

            // Removing unwanted fields
            for(let i=0;i<data.length;i++){
                
                delete data[i].position;
                delete data[i].snippet;
                delete data[i].prerender;
                delete data[i].cached_page_url;
                delete data[i].related_pages_url;
                delete data[i].site_name;
            
            }

            const wb1 = xlsx.utils.book_new();                   // New workbook
            ws = xlsx.utils.json_to_sheet(data);   //New worksheet
            xlsx.utils.book_append_sheet(wb1,ws)                 // appending workbook to worksheet
            xlsx.writeFile(wb1,"Google scrapping results.xlsx");
            console.log('Excel file updated!!!');
        }
    }

}
main();