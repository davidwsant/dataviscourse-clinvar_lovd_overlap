// read the csv using d3-fetch

d3.csv('data/MLD_Valid.csv').then(function(data){
    console.log(data)

    // call main class
    new Main(data)
});


class Main {

    constructor(data) {

        // get all unique diseases and genes from the data
        this.diseases = []
        this.genes = []

        for (let d of data){
            let disease = d.Disease
            let gene = d["Gene Symbol"]
            if (!this.diseases.includes(disease)){
                this.diseases.push(disease)
            }
            if (!this.genes.includes(gene)){
                this.genes.push(gene)
            }
        }

        console.log(this.diseases)
        console.log(this.genes)




    }


}