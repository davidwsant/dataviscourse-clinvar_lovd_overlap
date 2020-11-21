// read the csv using d3-fetch

Promise.all([
    d3.csv("data/MLD_Valid.csv"), // read in the MLD data
    d3.json("data/Genomic_Features.json"), // read the genomic features data
    d3.csv("data/MLD_Invalid.csv") // read the invalid MLD data
]).then(function(data){
    let MLD_data = data[0]
    let genomic_features = data[1]
    let invalid_data = data[2]

    // call the class
    new Main(MLD_data, genomic_features, invalid_data)
    
})


class Main {

    constructor(MLD_data, genomic_features, invalid_data) {
        this.MLD_data = MLD_data 
        this.genomic_features = genomic_features
        this.invalid_data = invalid_data

        for (let variant of this.MLD_data) {
            variant['Overall_MAF'] = +variant['Overall_MAF']
            variant['Position Start'] = +variant['Position Start']
            variant['Position Stop'] = +variant['Position Stop']
            variant['Variant Length'] = +variant['Variant Length']
            let midPoint = Math.round((variant['Position Stop'] + variant['Position Start'])/2)
            variant['Position Middle'] = midPoint
            let logFreq = 6
            if (variant['Overall_MAF'] > 0.000001) {
                logFreq = -1*Math.log10(variant['Overall_MAF'])
            }
            variant['Frequency Position'] = logFreq
        }

        console.log(MLD_data)
        console.log(genomic_features)
        console.log(invalid_data)

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
        let frequencyDistance = d3.select('#frequency-distance')
        frequencyDistance.append('svg')
            .attr('id', 'frequency-distance-svg')
            .attr('width', 450)
            .attr('height', 300)
        let freqDistanceSVG = d3.select('#frequency-distance-svg')
        freqDistanceSVG
            .append('text')
            .attr('id', 'frequency-distance-text')
            .attr('text-anchor', 'middle')
            .attr('x', 225)
            .attr('y', 150)
            .style('font-size', '12px')
        freqDistanceSVG.append('g')
            .attr('id', 'freqDistanceXAxis')
            .attr('transform', 'translate(30,240)')
        
        freqDistanceSVG.append('g')
            .attr('id', 'freqDistanceYAxis')
            .attr('transform', 'translate(30,20)')
            
        freqDistanceSVG.append('g')
            .attr('id', 'freqDistancePlotSection')
            .attr("transform", "translate(30,20)")
        this.drawDistanceTSSScatter()
        this.updateWithGene()
        // console.log(this.diseases)
        // console.log(this.genes)
        // this.drawItNow()
        // this.redraw()


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
    drawDistanceTSSScatter(){
        let dropDownValue = d3.select('#dropdownMenu').node().value
        let svg = d3.select('frequency-distance-svg')
        if (dropDownValue === "None Selected") {
            d3.select('#frequency-distance-text')
                .text('Please Select a Gene to see Chart')
            d3.select("#freqDistanceXAxis").attr('opacity', '0')
            d3.select("#freqDistanceYAxis").attr('opacity', '0')
            let scatterCircles = d3.select('#freqDistancePlotSection')
                .selectAll('circle')
                .data('')
                .join('circle')
        }
        else {
            //find TSS and TTS to filter out relevant variants
            let tss = +this.genomic_features[dropDownValue].TSS
            let tts = +this.genomic_features[dropDownValue].TTS
            let sense = this.genomic_features[dropDownValue].sense
            let geneLength = Math.abs(tts - tss)
            let addDistance = Math.round(geneLength*0.05)

            let relevantVariants = []
            let rangeStart = tss-addDistance
            let rangeStop = tts+addDistance
            if (sense === 'reverse') {
                rangeStart = tts-addDistance
                rangeStop = tss+addDistance
            }
            let keepDB = []
            for (let db of Object.entries(this.filters.databases)) {
                if (db[1]) {
                    keepDB.push(db[0])
                }
            }
            // console.log(keepDB)
            let keepPath = []
            for (let db of Object.entries(this.filters.pathogenicity)) {
                if (db[1]) {
                    keepPath.push(db[0])
                }
            }
            //console.log(keepPath)
            let keepType = []
            for (let db of Object.entries(this.filters.varType)) {
                if (db[1]) {
                    keepType.push(db[0])
                }
            }
            //console.log(keepType)
            let keepStatus = []
            for (let db of Object.entries(this.filters.reviewStatus)) {
                if (db[1]) {
                    keepStatus.push(db[0])
                }
            }
            keepStatus.push('-') // LOVD does not have a star status
            // console.log(keepStatus)
            // console.log(keepType)
            // console.log(keepPath)
            // console.log(keepDB)
            //console.log(this.MLD_data)
            for (let variant of this.MLD_data) {
                //console.log(variant)
                // Only keep variants that are not large copy number variants and within the range
                // Only keep variants that meet the filter crteria

                if (variant['Gene Symbol'] === dropDownValue && 
                    variant['Position Middle'] >= rangeStart &&
                    variant['Position Middle'] <= rangeStop &&
                    keepDB.includes(variant['Database']) &&
                    keepPath.includes(variant['Pathogenicity']) &&
                    keepType.includes(variant['Variant Type']) &&
                    keepStatus.includes(variant['Star Level'])) {
                        relevantVariants.push(variant) 
                    }
            }
            for (let variant of relevantVariants) {
                //sense
                //tss
                let distanceTss = variant['Position Middle'] - tss 
                if (sense === 'reverse') {
                    distanceTss = -1*distanceTss
                }
                variant['Distance from TSS'] = distanceTss
            }
            console.log(relevantVariants)
            let scaleX = d3.scaleLinear()
                .domain([-addDistance,geneLength+addDistance])
                .range([0, 400]) // use 30 for legend left, 20 for space right
            let scaleY = d3.scaleLinear()
                .domain([6,0])
                .range([0, 220]) // use 50 for legend
            // freqDistanceSVG.append('g')
            //     .attr('id', 'freqDistancePlotSection')
            //     .attr("transform", "translate(30,20)")

            let classDict = {'Pathogenic':'pathogenic', 
                'Likely Pathogenic':'likely-pathogenic', 
                'VUS':'vus', 
                'Likely Benign': 'likely-benign', 
                'Benign': 'benign',
                'Not Provided': 'not-provided',
                'Conflicting': 'conflicting'}

            
            let x_axis = d3.axisBottom(scaleX).ticks(10)
            d3.select("#freqDistanceXAxis").call(x_axis)
                .attr('opacity', '1')
                .selectAll('text')
                .style("text-anchor", "end")
                .attr('transform', 'rotate(-45)')
            let y_axis = d3.axisLeft(scaleY).ticks(7)
                d3.select("#freqDistanceYAxis").call(y_axis)
                .attr('opacity', '1')

            d3.select('#frequency-distance-text')
                .text('')
            let scatterCircles = d3.select('#freqDistancePlotSection')
                .selectAll('circle')
                .data(relevantVariants)
                .join('circle')

            let newCircles = scatterCircles.enter().append('circle')
                .attr('cx', d => scaleX(d['Distance from TSS']))
                .attr('cy', d => scaleY(d['Frequency Position']))
                .attr('r', '3')
                .attr('opacity', '0.5')
                .attr('class', d => classDict[d['Pathogenicity']])

            newCircles.merge(scatterCircles)
                .transition()
                .duration(1000)
                .attr('cx', d => scaleX(d['Distance from TSS']))
                .attr('cy', d => scaleY(d['Frequency Position']))
                .attr('r', '3')
                .attr('opacity', '0.5')
                .attr('class', d => classDict[d['Pathogenicity']])


        }
        //console.log(dropDownValue)
        

    }
    updateWithGene(){
        d3.select('#dropdownMenu').on('change', d => this.drawDistanceTSSScatter())
    }
    redraw(){
        let redrawButton = d3.select('#redraw-button')
        redrawButton.on('click', () => console.log('clicked')) //d => this.drawDistanceTSSScatter()
    }
    

}


