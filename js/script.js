// read the csv using d3-fetch

Promise.all([
    d3.csv("data/MLD_Valid.csv"), // read in the MLD data
    d3.json("data/Genomic_Features.json") // read the genomic features data
]).then(function(data){
    let MLD_data = data[0]
    let genomic_features = data[1]

    // call the class
    new Main(MLD_data, genomic_features)

})


class Main {

    constructor(MLD_data, genomic_features) {
        console.log(MLD_data)
        console.log(genomic_features)

        // get all unique diseases and genes from the data
        this.diseases = []
        this.genes = []

        for (let d of MLD_data){
            let disease = d.Disease
            let gene = d["Gene Symbol"]
            if (!this.diseases.includes(disease)){
                this.diseases.push(disease)
            }
            if (!this.genes.includes(gene)){
                this.genes.push(gene)
            }
        }

        this.filters = {'databases': {
            'ClinVar': true,
            'Human_Variome': true,
            'Global_Variome': true,
            'BIPmed_WES': true,
            'BIPmed_SNPhg19': true,
            'MSeqDR-LSDB': true,
            'CCHMC': true
        },
        'varType': {
            'single nucleotide variant': true,
            'Indel': true,
            'Deletion': true,
            'Duplication': true,
            'Insertion': true
        },
        'pathogenicity': {
            'Benign': true,
            'Likely Benign': true,
            'VUS': true,
            'Likely Pathogenic': true,
            'Pathogenic': true,
            'Conflicting': true,
            'Not Provided': true
        },
        'reviewStatus': {
            '0': true,
            '1': true,
            '2': true
        }}
        
        this.eventListeners()
        // console.log(this.diseases)
        // console.log(this.genes)


    }
    eventListeners() {
        //let clinVarButton = 
        d3.select('#checkBoxClinVar').on('change', (event) => {
            this.filters['databases']['ClinVar'] = event.path[0].checked
            console.log(this.filters)
        })
        d3.select('#checkBoxGlob').on('change', (event) => {
            this.filters['databases']['Global_Variome'] = event.path[0].checked
        })
        d3.select('#checkBoxHum').on('change', (event) => {
            this.filters['databases']['Human_Variome'] = event.path[0].checked
        })
        d3.select('#checkBoxBIPSNP').on('change', (event) => {
            this.filters['databases']['BIPmed_SNPhg19'] = event.path[0].checked
        })
        d3.select('#checkBoxBIPWES').on('change', (event) => {
            this.filters['databases']['BIPmed_WES'] = event.path[0].checked
        })
        d3.select('#checkBoxMSEQ').on('change', (event) => {
            this.filters['databases']['MSeqDR-LSDB'] = event.path[0].checked
        })
        d3.select('#checkBoxCCHMC').on('change', (event) => {
            this.filters['databases']['CCHMC'] = event.path[0].checked
        })

        // This was the way to use the DOM instead of d3 
        // let globButton = document.getElementById('checkBoxGlob')
        // globButton.addEventListener('change', (event) => {
        //     this.filters['databases']['Global_Variome'] = event.target.checked
        // })

        // Now for variant type
        d3.select('#checkBoxSNV').on('change', (event) => {
            this.filters['varType']['single nucleotide variant'] = event.path[0].checked
        })
        d3.select('#checkBoxDel').on('change', (event) => {
            this.filters['varType']['Deletion'] = event.path[0].checked
        })
        d3.select('#checkBoxDup').on('change', (event) => {
            this.filters['varType']['Duplication'] = event.path[0].checked
        })
        d3.select('#checkBoxIns').on('change', (event) => {
            this.filters['varType']['Insertion'] = event.path[0].checked
        })
        d3.select('#checkBoxIndel').on('change', (event) => {
            this.filters['varType']['Indel'] = event.path[0].checked
        })

        // Now for pathogenicity
        d3.select('#checkBoxBenign').on('change', (event) => {
            this.filters['pathogenicity']['Benign'] = event.path[0].checked
        })
        d3.select('#checkBoxLikBenign').on('change', (event) => {
            this.filters['pathogenicity']['Likely Benign'] = event.path[0].checked
        })
        d3.select('#checkBoxVUS').on('change', (event) => {
            this.filters['pathogenicity']['VUS'] = event.path[0].checked
        })
        d3.select('#checkBoxLikPath').on('change', (event) => {
            this.filters['pathogenicity']['Likely Pathogenic'] = event.path[0].checked
        })
        d3.select('#checkBoxPath').on('change', (event) => {
            this.filters['pathogenicity']['Pathogenic'] = event.path[0].checked
        })
        d3.select('#checkBoxCon').on('change', (event) => {
            this.filters['pathogenicity']['Conflicting'] = event.path[0].checked
        })
        d3.select('#checkBoxNotPro').on('change', (event) => {
            this.filters['pathogenicity']['Not Provided'] = event.path[0].checked
        })

        // Now for Review Status
        d3.select('#checkBoxReview0').on('change', (event) => {
            this.filters['reviewStatus']['0'] = event.path[0].checked
        })
        d3.select('#checkBoxReview1').on('change', (event) => {
            this.filters['reviewStatus']['1'] = event.path[0].checked
        })
        d3.select('#checkBoxReview2').on('change', (event) => {
            this.filters['reviewStatus']['2'] = event.path[0].checked
        })


    }
    


}
