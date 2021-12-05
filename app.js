const fs= require("fs");
const RequestClient = require("reqclient").RequestClient;
const csv = require('csv-parser');
const LOGIN=PASS="PavelYudin";
const baseUrl="https://kiraind.ru/leadball-test";
const fileName="orders.csv";

const client = new RequestClient({
  baseUrl,
  auth: {user: LOGIN, pass: PASS}
});

client.get("orders")
.then(result=>{
  return new Promise((resolve,reject)=>{
    fs.writeFile(fileName,result,(err)=>{
      if(err) throw err;
      console.log(`Запись в файл ${fileName} завершена.`);
      resolve();
    })
  })  
})
.then(()=>{
  return new Promise((resolve,reject)=>{
    const arrLines=[];
    fs.createReadStream(fileName)
    .pipe(csv())
    .on('data',data=>arrLines.push(data))
    .on('end',()=>{
      const delivery="self-pickup";
      let sum=count=0;
      arrLines.forEach((obj,i)=>{
        if(obj.phone[1]==="7" && obj.delivery===delivery){  
          sum+=+obj.orderTotal;
          count++;
        }
      });
      const average=Math.round(sum/count)/100+'';
      console.log("Средняя сумма - "+average);
      resolve(average);
    });
  });
})
.then(average=>{
  client.post("reports",{"average":average})
})
.catch(err=>console.log(err));

