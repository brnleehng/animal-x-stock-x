// POC using google sheets as an endpoint

const nodeFetch: any = require('node-fetch');

// fetch items from endpoint
nodeFetch("https://spreadsheets.google.com/feeds/list/1depNhby2e3v3oDQF2DPlAFpL5u0VHG3EydP3kXeJIuc/2/public/full?alt=json")
    .then((response: any) => {
        return response.json();
    })
    .then((data: any) => {
        console.log(data)
        data.feed.entry.forEach((element: any) => {
            console.log(element['gsx$name']['$t']);
            console.log(element['gsx$variation']['$t']);
            console.log(element['gsx$bodytitle']['$t']);
            console.log(element['gsx$pattern']['$t']);
            console.log(element['gsx$patterntitle']['$t']);
            console.log(element['gsx$diy']['$t']);
            console.log(element['gsx$tag']['$t']);
            console.log(element['gsx$source']['$t']);
            console.log(element['gsx$filename']['$t']);
            console.log(element['gsx$version']['$t']);
        });

    })