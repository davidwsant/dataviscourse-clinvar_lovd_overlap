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


        this.setupInvalidChart()

        // set global transition time
        this.transition_time = 1000

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

        for (let gene of Object.entries(this.genomic_features)) {
            let sense = gene[1].sense
            let tss = gene[1].TSS
            this.genomic_features[gene[0]].exons = []
            for (let entry of Object.entries(this.genomic_features[gene[0]].UTRs)) {
                let start = entry[1].start 
                let stop = entry[1].stop
                let distStart = start-tss 
                let distStop = stop-tss 
                if (sense === "reverse") {
                    distStart = -1*distStart
                    distStop = -1*distStop
                    this.genomic_features[gene[0]].exons.push({'start': distStop, 'stop': distStart, 'type': 'UTR'})
                }
                else {
                    this.genomic_features[gene[0]].exons.push({'start': distStart, 'stop': distStop, 'type': 'UTR'})
                }
            }
            for (let entry of Object.entries(this.genomic_features[gene[0]].CDS)) {
                let start = entry[1].start 
                let stop = entry[1].stop
                let distStart = start-tss 
                let distStop = stop-tss 
                if (sense === "reverse") {
                    distStart = -1*distStart
                    distStop = -1*distStop
                    this.genomic_features[gene[0]].exons.push({'start': distStop, 'stop': distStart, 'type': 'CDS'})
                }
                else {
                    this.genomic_features[gene[0]].exons.push({'start': distStart, 'stop': distStop, 'type': 'CDS'})
                }
                
            }
        }

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
            '2': true,
            '-': true
        }}
        
        this.eventListeners()
        let frequencyDistance = d3.select('#frequency-distance')
        this.freqDistance = {}
        this.freqDistance.margin = {}
        this.freqDistance.margin.top = 20
        this.freqDistance.margin.left = 15
        this.freqDistance.margin.right = 10
        this.freqDistance.margin.bottom = 20
        this.freqDistance.axis = {}
        this.freqDistance.axis.left = 30
        this.freqDistance.axis.bottom = 30
        this.freqDistance.figure = {}
        this.freqDistance.figure.height = 400
        this.freqDistance.figure.width = 650
        this.freqDistance.legend = {}
        this.freqDistance.legend.width = 300
        this.freqDistance.bars = {}
        this.freqDistance.bars.height = 70
        this.freqDistance.hover = {}
        this.freqDistance.hover.width = 250
        this.freqDistance.hover.height = 20




        let figWidth = this.freqDistance.margin.left+this.freqDistance.margin.right+this.freqDistance.axis.left+this.freqDistance.figure.width+this.freqDistance.legend.width
        let figHeight = this.freqDistance.margin.top+this.freqDistance.margin.bottom+this.freqDistance.axis.bottom+this.freqDistance.figure.height+this.freqDistance.bars.height

        frequencyDistance.append('svg')
            .attr('id', 'frequency-distance-svg')
            .attr('width', figWidth)
            .attr('height', figHeight)
        let freqDistanceSVG = d3.select('#frequency-distance-svg')
        freqDistanceSVG
            .append('text')
            .attr('id', 'frequency-distance-text')
            .attr('text-anchor', 'middle')
            .attr('x', this.freqDistance.margin.left+this.freqDistance.axis.left+0.5*this.freqDistance.figure.width) 
            .attr('y', this.freqDistance.margin.top+0.5*this.freqDistance.figure.height) 
            .style('font-size', '12px')
        let axisStartLeft = this.freqDistance.margin.left+this.freqDistance.axis.left
        let axisStartBottom = this.freqDistance.margin.top+this.freqDistance.figure.height
        freqDistanceSVG.append('g')
            .attr('id', 'freqDistanceXAxis')
            .attr('transform', 'translate('+axisStartLeft+','+axisStartBottom+')')
        
        freqDistanceSVG.append('g')
            .attr('id', 'freqDistanceYAxis')
            .attr('transform', 'translate('+axisStartLeft+','+this.freqDistance.margin.top+')')
            
        freqDistanceSVG.append('g')
            .attr('id', 'freqDistancePlotSection')
            .attr("transform", "translate("+axisStartLeft+","+this.freqDistance.margin.top+")")
        
        

        let legendHeight = this.freqDistance.margin.top+0.5*this.freqDistance.figure.height
        freqDistanceSVG.append('text')
            .attr('id', 'freqDistancePlotYAxisLabel')
            .attr("transform", "translate("+this.freqDistance.margin.left+","+legendHeight+") rotate(-90)")
            //.text('-log10 Minor Allele Frequency')
            .style('font-size', '16px')
            .attr('text-anchor', 'middle')

        let legendMidBottom = this.freqDistance.margin.left+this.freqDistance.axis.left+0.5*this.freqDistance.figure.width
        let legnedBottomHeight = this.freqDistance.margin.top+this.freqDistance.figure.height+this.freqDistance.margin.bottom+this.freqDistance.axis.bottom
        freqDistanceSVG.append('text')
            .attr('id', 'freqDistancePlotXAxisLabel')
            .attr("transform", "translate("+legendMidBottom+","+legnedBottomHeight+")")
            //.text('Distance from Transcription Start Site (TSS)')
            .style('font-size', '16px')
            .attr('text-anchor', 'middle')

        let freqDistLabelX = this.freqDistance.margin.left+this.freqDistance.axis.left+this.freqDistance.figure.width+20
        let freqDistanceLabel = freqDistanceSVG.append('g')
            .attr('id', 'freqDistancePlotLabel')
            .attr("transform", "translate("+freqDistLabelX+",50)")
        
        freqDistanceLabel.append('circle')
            .attr('cx', '15')
            .attr('cy', '10')
            .attr('r', '7')
            .attr('class', 'pathogenic')
            .attr('opacity', '0.7')

        freqDistanceLabel.append('text')
            .attr("transform", "translate(27,15)")
            .text('Pathogenic')

        freqDistanceLabel.append('circle')
            .attr('cx', '15')
            .attr('cy', '33')
            .attr('r', '7')
            .attr('class', 'likely-pathogenic')
            .attr('opacity', '0.7')

        freqDistanceLabel.append('text')
            .attr("transform", "translate(27,38)")
            .text('Likely Pathogenic')

        freqDistanceLabel.append('circle')
            .attr('cx', '15')
            .attr('cy', '56')
            .attr('r', '7')
            .attr('class', 'vus')
            .attr('opacity', '0.7')

        freqDistanceLabel.append('text')
            .attr("transform", "translate(27,61)")
            .text('Unknown Significance')

        freqDistanceLabel.append('circle')
            .attr('cx', '15')
            .attr('cy', '79')
            .attr('r', '7')
            .attr('class', 'likely-benign')
            .attr('opacity', '0.7')

        freqDistanceLabel.append('text')
            .attr("transform", "translate(27,84)")
            .text('Likely Benign')

        freqDistanceLabel.append('circle')
            .attr('cx', '15')
            .attr('cy', '102')
            .attr('r', '7')
            .attr('class', 'benign')
            .attr('opacity', '0.7')

        freqDistanceLabel.append('text')
            .attr("transform", "translate(27,107)")
            .text('Benign')

        freqDistanceLabel.append('circle')
            .attr('cx', '15')
            .attr('cy', '125')
            .attr('r', '7')
            .attr('class', 'not-provided')
            .attr('opacity', '0.7')

        freqDistanceLabel.append('text')
            .attr("transform", "translate(27,130)")
            .text('Not Provided')

        freqDistanceLabel.append('circle')
            .attr('cx', '15')
            .attr('cy', '148')
            .attr('r', '7')
            .attr('class', 'conflicting')
            .attr('opacity', '0.7')

        freqDistanceLabel.append('text')
            .attr("transform", "translate(27,153)")
            .text('Conflicting')

        let freqDistanceHoverBox = freqDistanceSVG.append('g')
            .attr('id', 'freqDistanceHoverBox')

        freqDistanceHoverBox.append('rect')
            .attr('width', this.freqDistance.hover.width)
            .attr('height', this.freqDistance.hover.height)
            .attr('rx', '5') // curvature line
            .attr('fill', 'none')

        freqDistanceHoverBox.append('text')
            .attr('id', 'freqDistanceHoverBoxText')
            .attr('x', (this.freqDistance.hover.width/2))
            .attr('y', (this.freqDistance.hover.height/2)+3)
            .attr('text-anchor', 'middle')
            .style('font-size', '12')


        let newX = freqDistLabelX+7
        let freqDistanceInfoBox = freqDistanceSVG.append('g')
            .attr('id', 'freqDistanceInfoBox')
            .attr("transform", "translate("+newX+",250)")


        freqDistanceInfoBox.append('text')
            .attr('id', 'freqDistanceInfoBoxTitle')
            .style('font-size', '16')
            .text('Click a Circle for Variant Info')

        freqDistanceInfoBox.append('text')
            .attr('id', 'freqDistanceInfoBoxHGVS')
            .attr('transform', 'translate(0, 20)')
            .style('font-size', '14')
            //.text('HGVS:')

        freqDistanceInfoBox.append('text')
            .attr('id', 'freqDistanceInfoBoxDB')
            .attr('transform', 'translate(0, 37)')
            .style('font-size', '14')
            //.text('Database:')

        freqDistanceInfoBox.append('text')
            .attr('id', 'freqDistanceInfoBoxPath')
            .attr('transform', 'translate(0, 54)')
            .style('font-size', '14')
            //.text('Pathogenicity:')

        freqDistanceInfoBox.append('text')
            .attr('id', 'freqDistanceInfoBoxChr')
            .attr('transform', 'translate(0, 71)')
            .style('font-size', '14')
            //.text('Chromosome:')

        freqDistanceInfoBox.append('text')
            .attr('id', 'freqDistanceInfoBoxStart')
            .attr('transform', 'translate(0, 88)')
            .style('font-size', '14')
            //.text('Start:')

        freqDistanceInfoBox.append('text')
            .attr('id', 'freqDistanceInfoBoxStop')
            .attr('transform', 'translate(0, 105)')
            .style('font-size', '14')
            //.text('Stop:')

        freqDistanceInfoBox.append('text')
            .attr('id', 'freqDistanceInfoBoxRef')
            .attr('transform', 'translate(0, 122)')
            .style('font-size', '14')
            //.text('Reference:')

        freqDistanceInfoBox.append('text')
            .attr('id', 'freqDistanceInfoBoxAlt')
            .attr('transform', 'translate(0, 137)')
            .style('font-size', '14')
            //.text('Alternate:')

        freqDistanceInfoBox.append('text')
            .attr('id', 'freqDistanceInfoBoxFreq')
            .attr('transform', 'translate(0, 154)')
            .style('font-size', '14')
            //.text('Minor Allele Frequency:')
        let structureStartY = this.freqDistance.margin.top+this.freqDistance.margin.bottom+this.freqDistance.axis.bottom+this.freqDistance.figure.height
        let freqDistanceGeneStructure = freqDistanceSVG.append('g')
            .attr('id', 'freqDistanceGeneStructure')
            .attr('transform', 'translate('+axisStartLeft+','+structureStartY+')')
        freqDistanceGeneStructure.append('line')
            .attr('id', 'tssToTtsLine')
            .style('stroke-width', 1)
            .style('stroke', 'black')
            .attr('y1', this.freqDistance.bars.height*0.5)
            .attr('y2', this.freqDistance.bars.height*0.5)

        let labelStartY = structureStartY+this.freqDistance.bars.height
        
        let labelStartX = this.freqDistance.margin.left+this.freqDistance.axis.left+this.freqDistance.figure.width*0.5
        let freqDistStructureLabel = freqDistanceSVG
            .append('g')
            .attr('id', 'freqDistStructureLabel')
            .attr('transform', 'translate('+labelStartX+','+labelStartY+')')
            .attr('text-anchor', 'middle')

        freqDistStructureLabel.append('text').attr('id', 'geneStructureText')
        let nextlabelStartX = this.freqDistance.margin.left+this.freqDistance.axis.left+this.freqDistance.figure.width+10
        let freqDistStructureFigures = freqDistanceSVG
            .append('g')
            .attr('id', 'freqDistStructureFigures')
            .attr('transform', 'translate('+nextlabelStartX+','+structureStartY+')')
            
        freqDistStructureFigures.append('text')
            .attr('id', 'exonsLabel')
            .attr('transform', 'translate(30, 21)')
            .text('Exons')

        freqDistStructureFigures.append('text')
            .attr('id', 'UTRLabel')
            .attr('transform', 'translate(30, 42)')
            .text('Untranslated Exons')

        freqDistStructureFigures.append('text')
            .attr('id', 'intronLabel')
            .attr('transform', 'translate(30, 61)')
            .text('Introns')

        freqDistStructureFigures.append('rect')
            .attr('id', 'exonsRect')
            .attr('transform', 'translate(0, 0)')
            .attr('height', '25')
            .attr('width', '20')
            //.text('Exons')
        freqDistStructureFigures.append('rect')
            .attr('id', 'UTRRect')
            .attr('transform', 'translate(0, 31)')
            .attr('width', '20')
            .attr('height', '10')
            //.text('Untranslated Exons')
        freqDistStructureFigures.append('line')
            .attr('id', 'intronRect')
            .attr('x1', 0)
            .attr('x1', 20)
            .attr('y1', 56)
            .attr('y2', 56)
            .style('stroke-width', 1)
            .style('stroke', 'black')


        
// Set up svg and axes for pathogenicity line graph


        let margins = {left: 50, top: 30}
        let svg_width = 600
        let svg_height = 400

        let pathogenicityGraphSVG = d3.select('#pathogenicity-graph').append('svg')
            .attr('width', 600)
            .attr('height', 400)
            .attr('id', 'pathogenicity-svg')
            .attr("transform", "translate(40,20)")

        let y_axis_group = pathogenicityGraphSVG.append('g')
            .attr('id', 'pathogenicity-y-axis')
            .attr('transform', `translate(${margins.left}, ${-margins.top})`)
        
        let x_axis_group = pathogenicityGraphSVG.append('g')
            .attr('id', 'pathogenicity-x-axis')
            .attr('transform', `translate(${margins.left}, ${svg_height - margins.top})`)

        d3.select('#pathogenicity-svg').append('text')
            .text('Proportion')
            .style('text-anchor', 'middle')
            .attr('y', 12)
            .attr('x', -180)
            .attr('transform', 'rotate(-90)')

        let radius = 6
        pathogenicityGraphSVG.append('circle')
            .attr('id', 'asra-legend')
            .attr('cx', 500)
            .attr('cy', 42)
            .attr('r', radius)
            .style('fill', 'red')

        
        pathogenicityGraphSVG.append('circle')
            .attr('id', 'psap-legend')
            .attr('cx', 500)
            .attr('cy', 62)
            .attr('r', radius)
            .style('fill', 'blue')

        pathogenicityGraphSVG.append('circle')
            .attr('id', 'sumf1-legend')
            .attr('cx', 500)
            .attr('cy', 82)
            .attr('r', radius)
            .style('fill', 'green')

        pathogenicityGraphSVG.append('text')
            .text('ASRA')
            .attr('x', 510)
            .attr('y', 47)
        
        pathogenicityGraphSVG.append('text')
            .text('PSAP')
            .attr('x', 510)
            .attr('y', 67)
        
        pathogenicityGraphSVG.append('text')
            .text('SUMF1')
            .attr('x', 510)
            .attr('y', 87)

        this.drawDistanceTSSScatter()
        this.updateWithGene()
        this.pathogenicityGraph()
        this.drawInvalidChart()
        this.storyTelling()
        this.setStoryTellingElements()
        this.resetStoryBoard()



    }
    eventListeners() {
        $('#checkBoxClinVar').on('change', (event) => {
            this.filters['databases']['ClinVar'] = event.target.checked

        })
        $('#checkBoxGlob').on('change', (event) => {
            this.filters['databases']['Global_Variome'] = event.target.checked
        })
       $('#checkBoxHum').on('change', (event) => {
            this.filters['databases']['Human_Variome'] = event.target.checked
        })
        $('#checkBoxBIPSNP').on('change', (event) => {
            this.filters['databases']['BIPmed_SNPhg19'] = event.target.checked
        })
        $('#checkBoxBIPWES').on('change', (event) => {
            this.filters['databases']['BIPmed_WES'] = event.target.checked
        })
        $('#checkBoxMSEQ').on('change', (event) => {
            this.filters['databases']['MSeqDR-LSDB'] = event.target.checked
        })
        $('#checkBoxCCHMC').on('change', (event) => {
            this.filters['databases']['CCHMC'] = event.target.checked
        })

        // This was the way to use the DOM instead of d3 
        // let globButton = document.getElementById('checkBoxGlob')
        // globButton.addEventListener('change', (event) => {
        //     this.filters['databases']['Global_Variome'] = event.target.checked
        // })

        // Now for variant type
        $('#checkBoxSNV').on('change', (event) => {
            this.filters['varType']['single nucleotide variant'] = event.target.checked
        })
        $('#checkBoxDel').on('change', (event) => {
            this.filters['varType']['Deletion'] = event.target.checked
        })
        $('#checkBoxDup').on('change', (event) => {
            this.filters['varType']['Duplication'] = event.target.checked
        })
        $('#checkBoxIns').on('change', (event) => {
            this.filters['varType']['Insertion'] = event.target.checked
        })
        $('#checkBoxIndel').on('change', (event) => {
            this.filters['varType']['Indel'] = event.target.checked
        })

        // Now for pathogenicity
        $('#checkBoxBenign').on('change', (event) => {
            this.filters['pathogenicity']['Benign'] = event.target.checked
        })
        $('#checkBoxLikBenign').on('change', (event) => {
            this.filters['pathogenicity']['Likely Benign'] = event.target.checked
        })
        $('#checkBoxVUS').on('change', (event) => {
            this.filters['pathogenicity']['VUS'] = event.target.checked
        })
        $('#checkBoxLikPath').on('change', (event) => {
            this.filters['pathogenicity']['Likely Pathogenic'] = event.target.checked
        })
       $('#checkBoxPath').on('change', (event) => {
            this.filters['pathogenicity']['Pathogenic'] = event.target.checked
        })
        $('#checkBoxCon').on('change', (event) => {
            this.filters['pathogenicity']['Conflicting'] = event.target.checked
        })
        $('#checkBoxNotPro').on('change', (event) => {
            this.filters['pathogenicity']['Not Provided'] = event.target.checked
        })

        // Now for Review Status
        $('#checkBoxReview0').on('change', (event) => {
            this.filters['reviewStatus']['0'] = event.target.checked
        })
        $('#checkBoxReview1').on('change', (event) => {
            this.filters['reviewStatus']['1'] = event.target.checked
        })
        $('#checkBoxReview2').on('change', (event) => {
            this.filters['reviewStatus']['2'] = event.target.checked
        })

        // redraw button
        let redrawButton = $('#redraw-button')
        redrawButton.on('click', ()=>{
            //console.log("redrawing")
            this.redraw()
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
            d3.select('#freqDistancePlotYAxisLabel').text('')
            d3.select('#freqDistancePlotXAxisLabel').text('')
            d3.select('#tssToTtsLine').attr('x1', '0').attr('x2', '0')
            let addRectangles = d3.select('#freqDistanceGeneStructure')
                .selectAll('rect')
                .data('')
                .join('rect')
            d3.select('#geneStructureText').text('')
            d3.select('#exonsLabel').text('') // Exons
            d3.select('#UTRLabel').text('') // Untranslated Exons
            d3.select('#intronLabel').text('') // Introns
            d3.select('#exonsRect').attr('width', '0') // 20
            d3.select('#UTRRect').attr('width', '0') // 20
            d3.select('#intronRect').style('stroke-width', 0) // 1

        }
        else {
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

            let keepPath = []
            for (let db of Object.entries(this.filters.pathogenicity)) {
                if (db[1]) {
                    keepPath.push(db[0])
                }
            }

            let keepType = []
            for (let db of Object.entries(this.filters.varType)) {
                if (db[1]) {
                    keepType.push(db[0])
                }
            }

            let keepStatus = []
            for (let db of Object.entries(this.filters.reviewStatus)) {
                if (db[1]) {
                    keepStatus.push(db[0])
                }
            }


            for (let variant of this.MLD_data) {

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
                let distanceTss = variant['Position Middle'] - tss 
                if (sense === 'reverse') {
                    distanceTss = -1*distanceTss
                }
                variant['Distance from TSS'] = distanceTss
            }

            let scaleX = d3.scaleLinear()
                .domain([-addDistance,geneLength+addDistance])
                .range([0, this.freqDistance.figure.width]) 
            let scaleY = d3.scaleLinear()
                .domain([6,0])
                .range([0, this.freqDistance.figure.height]) 

            // Draw rectangles for exons 
            d3.select('#geneStructureText').text('Gene Structure')
            d3.select('#exonsLabel').text('Exons') // 
            d3.select('#UTRLabel').text('Untranslated Exons') 
            d3.select('#intronLabel').text('Introns')
            d3.select('#exonsRect').attr('width', '20') 
            d3.select('#UTRRect').attr('width', '20') 
            d3.select('#intronRect').style('stroke-width', 1) 
            let addRectangles = d3.select('#freqDistanceGeneStructure')
                .selectAll('rect')
                .data(this.genomic_features[dropDownValue].exons)
                .join('rect')

            let newRectangles = addRectangles.enter()
                .append('circle')
                .attr('transform', d => {
                    let localY = this.freqDistance.bars.height*0.5-12.5
                    if (d['type'] === "UTR") {
                        localY = this.freqDistance.bars.height*0.5-5
                    }
                    let localX = scaleX(d.start)
                    return 'translate('+localX+','+localY+')'
                }) 
                .attr('width', d => {
                    let localStart = scaleX(d.start)
                    let localStop = scaleX(d.stop)
                    let localWidth = localStop-localStart
                    return localWidth
                })
                .attr('height', d => {
                    if (d['type'] === "UTR") {
                        return 10
                    }
                    return 25
                })

            let mergedRectangles = newRectangles.merge(addRectangles)
                .transition()
                .duration(this.transition_time)
                .attr('transform', d => {
                    let localY = this.freqDistance.bars.height*0.5-12.5
                    if (d['type'] === "UTR") {
                        localY = this.freqDistance.bars.height*0.5-5
                    }
                    let localX = scaleX(d.start)
                    return 'translate('+localX+','+localY+')'
                }) 
                .attr('width', d => {
                    let localStart = scaleX(d.start)
                    let localStop = scaleX(d.stop)
                    let localWidth = localStop-localStart
                    return localWidth
                })
                .attr('height', d => {
                    if (d['type'] === "UTR") {
                        return 10
                    }
                    return 25
                })

            d3.select('#tssToTtsLine')
                .attr('x1', scaleX(0))
                .attr('x2', scaleX(geneLength))

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

            d3.select('#freqDistancePlotYAxisLabel').text('-Log base 10 Minor Allele Frequency')
            d3.select('#freqDistancePlotXAxisLabel').text('Distance from Transcription Start Site (TSS)')
            d3.select('#frequency-distance-text')
                .text('')
            let scatterCircles = d3.select('#freqDistancePlotSection')
                .selectAll('circle')
                .data(relevantVariants)
                .join('circle')

            let circleRadius = 5
            let newCircles = scatterCircles.enter().append('circle')
                .attr('cx', d => scaleX(d['Distance from TSS'])) // 0.5*this.freqDistance.figure.width
                .attr('cy', d => scaleY(d['Frequency Position'])) // 0.5*this.freqDistance.figure.height
                .attr('r', circleRadius)
                .attr('opacity', '0.4')
                .attr('class', d => classDict[d['Pathogenicity']])

            let mergedCircles = newCircles.merge(scatterCircles)
                .transition()
                .duration(this.transition_time)
                .attr('cx', d => scaleX(d['Distance from TSS']))
                .attr('cy', d => scaleY(d['Frequency Position']))
                .attr('r', circleRadius)
                .attr('opacity', '0.4')
                .attr('class', d => classDict[d['Pathogenicity']])

            scatterCircles.on('mouseover', (event, d)=>{
                d3.select(event.target)
                    .attr('opacity', '1')
                    .attr('stroke', 'black')

                let currentX = scaleX(d['Distance from TSS'])+this.freqDistance.margin.left+this.freqDistance.axis.left+15
                if (currentX > 0.65*(this.freqDistance.margin.left+this.freqDistance.axis.left+this.freqDistance.figure.width)) {
                    currentX = currentX-this.freqDistance.hover.width-25
                }
                let currentY = scaleY(d['Frequency Position'])+20
                let hoverBox = d3.select('#freqDistanceHoverBox')
                hoverBox.attr('transform', 'translate('+currentX+', ' + currentY + ') scale(1, 1)')
                hoverBox.select('rect')
                    .attr('fill', 'white')
                    .attr('stroke', 'black')
                    .attr('opacity', '0.7')
                let freqDistanceHoverBoxText = d3.select('#freqDistanceHoverBoxText')
                    .text(d['HGVS Normalized Genomic Annotation'])

                })

            scatterCircles.on('mouseout', event=>{
                d3.select(event.target)
                    .attr('opacity', '0.4')
                    .attr('stroke', '')

                let hoverBox = d3.select('#freqDistanceHoverBox')
                hoverBox.select('rect')
                    .attr('transform', 'translate('+0+', ' + 0 + ') scale(1, 1)')
                    .attr('fill', 'none')
                    .attr('stroke', 'none')
                    .attr('opacity', '0')

                d3.select('#freqDistanceHoverBoxText')
                    .text('')

                })

            scatterCircles.on('click', (event, d) => {
                d3.select('#freqDistanceInfoBoxTitle').text('Variant Information')
                let textLength = d['HGVS Normalized Genomic Annotation'].length
                if (textLength > 35) {
                    d3.select('#freqDistanceInfoBoxHGVS').text('HGVS too long to display')
                }
                else if (textLength > 27) {
                    d3.select('#freqDistanceInfoBoxHGVS').text(d['HGVS Normalized Genomic Annotation'])
                }
                else {
                    d3.select('#freqDistanceInfoBoxHGVS').text('HGVS: '+d['HGVS Normalized Genomic Annotation'])
                }
                d3.select('#freqDistanceInfoBoxDB').text('Database: '+d['Database'].replace(/_/g, ' '))
                d3.select('#freqDistanceInfoBoxPath').text('Pathogenicity: '+d['Pathogenicity'])
                d3.select('#freqDistanceInfoBoxChr').text('Chromosome: '+d['Chr'])
                d3.select('#freqDistanceInfoBoxStart').text('Start: '+d['Position Start'])
                d3.select('#freqDistanceInfoBoxStop').text('Stop: '+d['Position Stop'])
                let refLength = d['Ref'].length 
                if (refLength > 25) {
                    d3.select('#freqDistanceInfoBoxRef').text('Reference too long to display')
                }
                else {
                    d3.select('#freqDistanceInfoBoxRef').text('Reference: '+d['Ref'])
                }
                let altLength = d['Alt'].length
                if (altLength > 25) { 
                    d3.select('#freqDistanceInfoBoxAlt').text('Alternate too long to display')
                }
                else {
                    d3.select('#freqDistanceInfoBoxAlt').text('Alternate: '+d['Alt'])
                }
                let countDecimals = function(value) {
                    if (Math.floor(value) !== value) {
                        return value.toString().split(".")[1].length || 0;
                    }
                    return 0
                }
                let freqLength = countDecimals(d['Overall_MAF'])
                if (freqLength > 12) {
                    let reportMAF = d['Overall_MAF'].toFixed(9)
                    d3.select('#freqDistanceInfoBoxFreq').text('Frequency: '+reportMAF)
                }
                else {
                    d3.select('#freqDistanceInfoBoxFreq').text('Frequency: '+d['Overall_MAF'])
                }
                
            })

            function clearInfoBox(){
                d3.select('#freqDistanceInfoBoxTitle').text('Click a Circle for Variant Info')
                d3.select('#freqDistanceInfoBoxHGVS').text('')
                d3.select('#freqDistanceInfoBoxDB').text('')
                d3.select('#freqDistanceInfoBoxPath').text('')
                d3.select('#freqDistanceInfoBoxChr').text('')
                d3.select('#freqDistanceInfoBoxStart').text('')
                d3.select('#freqDistanceInfoBoxStop').text('')
                d3.select('#freqDistanceInfoBoxRef').text('')
                d3.select('#freqDistanceInfoBoxAlt').text('')
                d3.select('#freqDistanceInfoBoxFreq').text('')
            }

            d3.select('#frequency-distance').on('click', clearInfoBox, true)

           
        }

    }    
    pathogenicityGraph(){

        // first set up the data 
        let pathogenicityClasses = ['Benign', 'Likely Benign', 'VUS', 
        'Likely Pathogenic', 'Pathogenic', 'Conflicting', 'Not Provided']

        let gene_symbols = ['ARSA', 'PSAP', 'SUMF1']

        // only include pathogenicity classes that are selected in the page
        let includedClasses = []
        let includedDatabases = []
        let includedVarType = []
        let includedStar = []


        for (let i of Object.entries(this.filters.pathogenicity)){
            if (i[1]){
                includedClasses.push(i[0])
            }
        };
        for (let i of Object.entries(this.filters.databases)){

            if (i[1]){
                includedDatabases.push(i[0])
            }
        };

        for (let i of Object.entries(this.filters.varType)){
            if (i[1]){
                includedVarType.push(i[0])
            }
        };

        for (let i of Object.entries(this.filters.reviewStatus)){
            if (i[1]){
                includedStar.push(i[0])
            }
        };

        let benign_list = []
        let likely_benign_list = []
        let vus_list = []
        let likely_pathogenic_list = []
        let pathogenic_list = []
        let conflicting_list = []
        let not_provided_list = []

        // loop through the MLD_data to get all the pathogenicity values
        for (let i of this.MLD_data) {
            let pathogenicity = i.Pathogenicity
            let hgvs = i['HGVS Normalized Genomic Annotation']
            let gene_symbol = i['Gene Symbol']

            // filter based on database selection
            if (!includedDatabases.includes(i.Database)){ 
                continue
            }

            // filter based on variant type
            if (!includedVarType.includes(i['Variant Type'])){
                continue
            }

            //filter based on star level
            if (!includedStar.includes(i['Star Level'])){
                continue
            }


            // check that the pathogenicity is selected on the page
            if (includedClasses.includes(pathogenicity)){

                // now we want to check which pathogenicity it is, and make sure the 
                // HGVS normalized genomic annotation isn't already in the list to avoid duplicates
                if (pathogenicity === 'Benign' && !benign_list.includes(hgvs)){
                    benign_list.push({'HGVS': hgvs, 'gene_symbol': gene_symbol, 'Database': i.Database})
                }

                else if (pathogenicity === 'Likely Benign' && !likely_benign_list.includes(hgvs)){
                    likely_benign_list.push({'HGVS': hgvs, 'gene_symbol': gene_symbol, 'Database': i.Database})
                }

                else if (pathogenicity === 'VUS' && !vus_list.includes(hgvs)){
                    vus_list.push({'HGVS': hgvs, 'gene_symbol': gene_symbol, 'Database': i.Database})
                }

                else if (pathogenicity === 'Likely Pathogenic' && 
                !likely_pathogenic_list.includes(hgvs)){
                    likely_pathogenic_list.push({'HGVS': hgvs, 'gene_symbol': gene_symbol, 'Database': i.Database})
                }

                else if (pathogenicity === 'Pathogenic' && !pathogenic_list.includes(hgvs)){
                    pathogenic_list.push({'HGVS': hgvs, 'gene_symbol': gene_symbol, 'Database': i.Database})
                }
            
                else if (pathogenicity === 'Conflicting' && !conflicting_list.includes(hgvs)){
                    conflicting_list.push({'HGVS': hgvs, 'gene_symbol': gene_symbol, 'Database': i.Database})
                }

                else if (pathogenicity === 'Not Provided' && !not_provided_list.includes(hgvs)){
                    not_provided_list.push({'HGVS': hgvs, 'gene_symbol': gene_symbol, 'Database': i.Database})
                }

            }
            
        }
        

        // now, determine the total count of all the pathogenicity classes

        let all_lists = [benign_list, likely_benign_list, vus_list, 
            likely_pathogenic_list, pathogenic_list, conflicting_list, 
            not_provided_list]


        // look at all databases in the data lists

        let total_count = 0
        let total_arsa = 0
        let total_psap = 0
        let total_sumf1 = 0

        // list of counts for ARSA, PSAP, and SUMF1 genes in that order
        let list_of_counts = [new Array(7).fill(0), new Array(7).fill(0), new Array(7).fill(0)]
        
        
        for (let i = 0; i<all_lists.length; i++){
            let list = all_lists[i]
            total_count = total_count += list.length
            for (let j = 0; j<list.length; j++){
                let item = list[j]
                // let gene_symbol = item.gene_symbol
                if (item.gene_symbol === 'ARSA'){
                    total_arsa ++
                    list_of_counts[0][i] ++
                }
                else if (item.gene_symbol === 'PSAP'){
                    total_psap ++
                    list_of_counts[1][i] ++
                }
                else if (item.gene_symbol === 'SUMF1'){
                    total_sumf1 ++
                    list_of_counts[2][i] ++
                }
            }
        }

        let arsa_percentages = list_of_counts[0].map(function(x){return x/total_arsa})
        let psap_percentages = list_of_counts[1].map(function(x){return x/total_psap})
        let sumf1_percentages = list_of_counts[2].map(function(x){return x/total_sumf1})


        let percentages = [arsa_percentages, psap_percentages, sumf1_percentages]

        let percentages_data = []
        for (let i=0; i<percentages.length; i++){
            let symbol = gene_symbols[i]
            let list = percentages[i]
            let temp_data = []
            for (let j=0; j<arsa_percentages.length; j++){
                temp_data.push({'gene': symbol, 'pathogenicity': pathogenicityClasses[j], 
                'value': list[j]})
            }
            percentages_data.push(temp_data)
        }
        
        // the percentages data for lines graph won't include values for "conflicting" or "not reported"
        
        let lines_data = []
        for (let list of percentages_data){
            let temp_array = []
            for (let item of list){
                let path = item.pathogenicity
                if (path !== 'Conflicting' && path !== 'Not Provided'){
                    temp_array.push(item)
                }
            }
            lines_data.push(temp_array)
        }

        // convert any "NaN" value in data to 0
        for (let i of percentages_data){
            for (let j of i){
                j.value = j.value ? j.value : 0
            }
        };


        // set up the svg
        let svg_width = 600
        let svg_height = 400
        let margins = {left: 50, top: 30}

        let pathogenicityGraphSVG = d3.select("#pathogenicity-svg")

        // define scales
        let scaleX = d3.scaleBand()
            .domain(pathogenicityClasses)
            .range([0, svg_width - margins.left])


        let scaleY = d3.scaleLinear()
            .domain([1, 0])
            .range([40, svg_height])

        // set up axes
        let y_axis = d3.axisLeft(scaleY)
            .ticks(4)
        
        let x_axis = d3.axisBottom(scaleX)
            .ticks(8)
            .tickFormat((d,i)=>pathogenicityClasses[i])

        

        let y_axis_group = d3.select('#pathogenicity-y-axis') 
            .call(y_axis)

        
        let x_axis_group = d3.select('#pathogenicity-x-axis') 
            .call(x_axis)

        
        // draw the graph

        // set transition duration time
        let duration = this.transition_time

        let linesgenerator = d3.line()
            .x(d=>scaleX(d.pathogenicity))
            .y(d=>scaleY(d.value));
            
        pathogenicityGraphSVG.append('g')
            .attr('id', 'ASRA-group')
            .attr('transform', `translate(${margins.left + 40}, -${margins.top})`)

        
        pathogenicityGraphSVG.append('g')
            .attr('id', 'PSAP-group')
            .attr('transform', `translate(${margins.left + 40}, -${margins.top})`)

        pathogenicityGraphSVG.append('g')
            .attr('id', 'SUMF1-group')
            .attr('transform', `translate(${margins.left + 40}, -${margins.top})`)

        // draw lines
        d3.select('#ASRA-group')  
            .selectAll('path')
            .data([1])
            .join(
                enter => {enter.append('path')
                    .style('stroke', 'red')
                    .classed('line-chart', true)
                    .classed('asra', true)
                    .transition()
                        .duration(duration)
                        .attr('d', linesgenerator(lines_data[0]))},
                
                update=>{update
                    .transition()
                    .duration(duration)
                    .attr('d', linesgenerator(lines_data[0]))},

                exit => {exit
                    .transition()
                    .duration(duration)
                    .remove()}

            )

        d3.select('#PSAP-group')
            .selectAll('path')
            .data([1])
            .join(
                enter => {enter.append('path')
                    .style('stroke', 'blue')
                    .classed('line-chart', true)
                    .classed('psap', true)
                
                    .transition()
                        .duration(duration)
                        .attr('d', linesgenerator(lines_data[1]))},
                
                update=>{update
                    .transition()
                    .duration(duration)
                    .attr('d', linesgenerator(lines_data[1]))},

                exit => {exit
                    .transition()
                    .duration(duration)
                    .remove()}

            )
        
        d3.select('#SUMF1-group')
            .selectAll('path')
            .data([1])
            .join(
                enter => {enter.append('path')
                    .style('stroke', 'green')
                    .classed('line-chart', true)
                    .classed('sumf1', true)
                
                    .transition()
                        .duration(duration)
                        .attr('d', linesgenerator(lines_data[2]))},
                
                update=>{update
                    .transition()
                    .duration(duration)
                    .attr('d', linesgenerator(lines_data[2]))},

                exit => {exit
                    .transition()
                    .duration(duration)
                    .remove()}

            )

    
        // draw circles
        let radius = 6
        let asra_circles = d3.select('#ASRA-group').selectAll('circle')
            .data(percentages_data[0])
            .join(
                enter => {enter.append('circle')
                    .attr('r', radius)
                    .attr('cx', d=>scaleX(d.pathogenicity))
                    .attr('cy', d=>scaleY(d.value))
                    .style('fill', 'red')
                    .classed('asra', true)
                .append('title')
                    .text(d=>`${d.pathogenicity}, ${parseFloat(d.value).toFixed(2)}`)
                    .transition()
                        .duration(duration)

                },
                update=>{update.transition()
                    .duration(duration)
                    .attr('r', radius)
                    .attr('cx', d=>scaleX(d.pathogenicity))
                    .attr('cy', d=>scaleY(d.value))
                    .style('fill', 'red')
                .select('title')
                    .text(d=>`${d.pathogenicity}, ${parseFloat(d.value).toFixed(2)}`)

                },
                exit=>{exit.transition()
                    .duration(duration)
                }
            )
            

        let psap_circles = d3.select('#PSAP-group').selectAll('circle')
            .data(percentages_data[1])
            .join(
                enter => {enter.append('circle')
                    .attr('r', radius)
                    .attr('cx', d=>scaleX(d.pathogenicity))
                    .attr('cy', d=>scaleY(d.value))
                    .style('fill', 'blue')
                    .classed('psap', true)
                .append('title')
                    .text(d=>`${d.pathogenicity}, ${parseFloat(d.value).toFixed(2)}`)
                    .transition()
                        .duration(duration)

                },
                update=>{update.transition()
                    .duration(duration)
                    .attr('r', radius)
                    .attr('cx', d=>scaleX(d.pathogenicity))
                    .attr('cy', d=>scaleY(d.value))
                    .style('fill', 'blue')
                .select('title')
                    .text(d=>`${d.pathogenicity}, ${parseFloat(d.value).toFixed(2)}`)

                },
                exit=>{exit.transition()
                    .duration(duration)
                }
            )

        let sumf1_circles = d3.select('#SUMF1-group').selectAll('circle')
            .data(percentages_data[2])
            .join(
                enter => {enter.append('circle')
                    .attr('r', radius)
                    .attr('cx', d=>scaleX(d.pathogenicity))
                    .attr('cy', d=>scaleY(d.value))
                    .style('fill', 'green')
                    .classed('sumf1', true)
                .append('title')
                    .text(d=>`${d.pathogenicity}, ${parseFloat(d.value).toFixed(2)}`)

                    .transition()
                        .duration(duration)

                },
                update=>{update.transition()
                    .duration(duration)
                    .attr('r', radius)
                    .attr('cx', d=>scaleX(d.pathogenicity))
                    .attr('cy', d=>scaleY(d.value))
                    .style('fill', 'green')
                .select('title')
                    .text(d=>`${d.pathogenicity}, ${parseFloat(d.value).toFixed(2)}`)

                },
                exit=>{exit.transition()
                    .duration(duration)
                }
            )


        
        // add hover change
        let all_lines = d3.select('#pathogenicity-svg').selectAll('path')
            .classed('not-hovered', true)
            .classed('hovered', false)

        let all_circles = d3.select('#pathogenicity-svg').selectAll('circle')
            .classed('not-hovered', true)
            .classed('hovered', false)

        all_lines.on('mouseover', event=>{
            
            d3.select(event.target)
                .classed('hovered', true)
                .classed('not-hovered', false)
        })
            .on('mouseout', event=>{
                d3.select(event.target)
                .classed('hovered', false)
                .classed('not-hovered', true)
            })

        all_circles.on('mouseover', event=>{
            
            let target = d3.select(event.target)
                .classed('hovered', true)
                .classed('not-hovered', false)
            
        })
            .on('mouseout', event=>{
                d3.select(event.target)
                    .classed('hovered', false)
                    .classed('not-hovered', true)
            })

        // hover over legend circles
        d3.select('#asra-legend').on('mouseover', event=>{
            d3.selectAll('.asra')
                .classed('hovered', true)
                .classed('not-hovered', false)
        })
            .on('mouseout', event=>{
                d3.selectAll('.asra')
                .classed('hovered', false)
                .classed('not-hovered', true)
            });

        d3.select('#psap-legend').on('mouseover', event=>{
            d3.selectAll('.psap')
                .classed('hovered', true)
                .classed('not-hovered', false)
        })
            .on('mouseout', event=>{
                d3.selectAll('.psap')
                    .classed('hovered', false)
                    .classed('not-hovered', true)
            });
        
        d3.select('#sumf1-legend').on('mouseover', event=>{                  
                d3.select('#pathogenicity-graph').selectAll('.sumf1')
                    .classed('hovered', true)
                    .classed('not-hovered', false)
        })
            .on('mouseout', event=>{
                d3.select('#pathogenicity-graph').selectAll('.sumf1')
                    .classed('hovered', false)
                    .classed('not-hovered', true)
            })


        
    }   
    updateWithGene(){
        d3.select('#dropdownMenu').on('change', d => {
            this.drawDistanceTSSScatter()
            this.drawInvalidChart()
        })
    }

    setupInvalidChart(){
        let margin = {top: 40, bottom: 20, left: 50, right: 40}
        let height = 600 - margin.top - margin.bottom
        let width = 800 - margin.left - margin.right

        let invalid_thing = d3.select("#invalid")
        invalid_thing.append('br')
        let invalid_svg = invalid_thing.append('svg')
            .attr('height', height + margin.top + margin.bottom)
            .attr('width', width + margin.left + margin.right)
            .attr('id', 'invalid-svg');

        invalid_svg
            .append('g')
            .attr('class', 'invalid-group')
        
        invalid_svg.append('g')
            .attr('id', 'invalid-legend')

        invalid_svg.append('g')
            .attr('id', 'invalid-y-label')

            .append('text')
                .attr('x', -290)
                .attr('y', 11)
                .text('Count')
                .attr('transform', 'rotate(-90)')

        invalid_svg.append('g')
            .attr('id', 'invalid-x-label')
            .append('text')
            .attr('x', width/2 -20)
            .attr('y', height +50)
            .text('Database')
    }
    drawInvalidChart(){
        let margin = {top: 40, bottom: 20, left: 50, right: 40}
        let height = 600 - margin.top - margin.bottom
        let width = 800 - margin.left - margin.right

        let dropDownValue = d3.select('#dropdownMenu').node().value

        let invalid_data_filtered = []

        // remove data objects that don't match the filtering criteria
        for (let i of this.invalid_data){
            let gene = i['Gene Symbol']
            if (dropDownValue === 'None Selected'){
                invalid_data_filtered.push(i)
            }
            else if (dropDownValue === gene){
                invalid_data_filtered.push(i)
            }
            else{
                continue
            }
        }


        //console.log(invalid_data_filtered)


        let failure_reasons = []
        let databases = []
        let Clinvar = []
        let Global_Variome = []
        let BIPmed_SNPhg19 = []

        for (let i of invalid_data_filtered){
            let failure_reason = i["HGVS Normalization Failure Reason"]
            let database = i.Database

            if (!failure_reasons.includes(failure_reason)){
                failure_reasons.push(failure_reason)
            }
            if (!databases.includes(database)){
                databases.push(database)
            }
        }




        invalid_data_filtered.forEach(i => {
            if (i.Database === 'ClinVar'){
                Clinvar.push(i)
            }
            else if (i.Database === 'Global_Variome'){
                Global_Variome.push(i)
            }
            else if (i.Database === 'BIPmed_SNPhg19'){
                BIPmed_SNPhg19.push(i)
            }
        })
        
        

        let ClinvarCounts = {};
        let globalVariomeCounts = {};
        let BIPmedSNPhg19Counts = {};


        Clinvar.forEach(d=>{
            let failure_reason = d["HGVS Normalization Failure Reason"]
            ClinvarCounts[failure_reason] = ClinvarCounts[failure_reason] ? ClinvarCounts[failure_reason] + 1 : 1;  
            ClinvarCounts['database'] = 'ClinVar'; 
        });

        Global_Variome.forEach(d=>{
            let failure_reason = d["HGVS Normalization Failure Reason"]
            globalVariomeCounts[failure_reason] = globalVariomeCounts[failure_reason] ? globalVariomeCounts[failure_reason] + 1 : 1;
            globalVariomeCounts['database'] = 'Global_Variome';
        })

        BIPmed_SNPhg19.forEach(d=>{
            let failure_reason = d["HGVS Normalization Failure Reason"]
            BIPmedSNPhg19Counts[failure_reason] = BIPmedSNPhg19Counts[failure_reason] ? BIPmedSNPhg19Counts[failure_reason] + 1 : 1;
            BIPmedSNPhg19Counts['database'] = 'BIPmed_SNPhg19'
        })

        let dataByDatabase = [ClinvarCounts, globalVariomeCounts, BIPmedSNPhg19Counts];
        // console.log('dataByDatabase:', dataByDatabase)

        


        // set up scales
        let scaleX = d3.scaleBand()
            .domain(databases)
            .range([margin.left, width])
            .padding(0.3)
        // PSAP has a max of 20, so adding 10 to the margin seems very excessive
        let yDomainMax = d3.max([Clinvar.length, Global_Variome.length, BIPmed_SNPhg19.length]) +10
        if (yDomainMax <= 60) {
            yDomainMax = d3.max([Clinvar.length, Global_Variome.length, BIPmed_SNPhg19.length]) + 1
        }
        let scaleY = d3.scaleLinear()
            //.domain([0, d3.max([Clinvar.length, Global_Variome.length, BIPmed_SNPhg19.length]) +10])
            .domain([0,yDomainMax])
            .range([height, 0])

        let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(failure_reasons)


        let yAxisGenerator = d3.axisLeft(scaleY)
            .ticks(6)
        
        let xAxisGenerator = d3.axisBottom(scaleX)
            .ticks(3)

        // append groups and call the axis generator

        let y_axis_group = d3.select('#invalid-svg').append('g')
            .attr('id', 'invalid-y-axis')
            .attr('transform', `translate(${margin.left}, 10)`)
            

        let x_axis_group = d3.select('#invalid-svg').append('g')
            .attr('id', 'invalid-x-axis')
            .attr('transform', `translate(0, ${height + 10})`)

        d3.select('#invalid-y-axis')
            .call(yAxisGenerator)
            
        d3.select('#invalid-x-axis')
            .call(xAxisGenerator)

        //console.log(dataByDatabase)

        let stackedData = d3.stack()   
            .keys(failure_reasons)(dataByDatabase)


        d3.selectAll('.invalid-group')
            .selectAll('g')
            .data(stackedData)
            .join(
                enter=>{
                    enter.append('g')
                        .attr('fill', d=>colorScale(d.key))
                        .attr('transform', 'translate(0, 10)')
                        .transition()
                            .duration(this.transition_time)
                },
                update=>{
                    update
                    .transition()
                        .duration(this.transition_time)
                    .attr('fill', d=>colorScale(d.key))
                },
                exit=>{exit.remove()
                }
            )

            d3.select('.invalid-group').selectAll('g')
                .selectAll('rect')
                .data(d=>d)
                .join(
                    enter=>{
                        enter.append('rect')
                            .attr('x', d=>scaleX(d.data.database))
                            .attr('y', d=>scaleY[d[1]] || 0)
                            .attr('y', 0)
                            .attr('height', 0)
                            .attr('width', scaleX.bandwidth())
                        .transition()
                            .duration(this.transition_time)
                            .attr('x', d=>scaleX(d.data.database))
                            .attr('y', d=>scaleY(d[1] || 0))
                            .attr('height', d=>{
                                return scaleY(d[0]) - scaleY(d[1]) || 0; })
                            .attr('width', scaleX.bandwidth())
                            
                    },
                    update=>{
                        update.transition()
                                .duration(this.transition_time)
                            .attr('x', d=>{
                                return scaleX(d.data.database)})
                            .attr('y', d=>scaleY(d[1] ? d[1]: 0))
                            .attr('height', d=>{return scaleY(d[0]) - scaleY(d[1]) || 0; })
                            .attr('width', scaleX.bandwidth())
                            

                    },
                    exit=>{

                        exit
                            .attr('height', 0)
                            .attr('width', scaleX.bandwidth())
                            .remove()

                    }
                )


                // add legend
                
                let groups = d3.select('#invalid-legend').selectAll('g')
                    .data(failure_reasons)
                    .join(
                        enter=>{enter.append('g')
                            .attr('class', 'legend-groups')
                            .attr('fill', d=>colorScale(d))

                    }, 
                        update=>update
                            .attr('class', 'legend-groups')
                            .attr('fill', d=>colorScale(d))

                        ,
                        exit=>exit.remove()
                    );
                
                groups.selectAll('rect')
                    .remove()

                groups.selectAll('text')
                    .remove()

                d3.selectAll('.legend-groups')
                    .append('rect')
                    .attr('x', 500)
                    .attr('y', (d,i)=>30 + i*20)
                    .attr('height', 10)
                    .attr('width', 10)
                
                d3.selectAll('.legend-groups')
                    .append('text')
                    .attr('x', 515)
                    .attr('y', (d,i)=>40 + i*20)
                    .text(d=>d) 
                    .attr('fill', 'black')
    }  
    
    redraw(){
        this.drawInvalidChart
        this.pathogenicityGraph()
        this.drawDistanceTSSScatter()
        this.drawInvalidChart()
    }
    setStoryTellingElements(){
        //d3.select('#storySVG1').attr('width', '600px').attr('height', '50px')
        d3.select('#storySVG1').attr('width', '0px').attr('height', '0px')
        let storySVG1 = d3.select('#storySVG1')
        let overlapSVGGroup1 = storySVG1.append('g').attr('id', 'storyGroup1')
        overlapSVGGroup1.append('rect').attr('id','storyTellingOverlapRect1')
            .attr('rx', '12')
            .attr('fill', 'white')
            .attr('stroke', 'black')
            .attr('height', '50')
            .attr('width', '600')
            
        overlapSVGGroup1.append('text').attr('id','storyTellingOverlapText1')
            .attr('transform' ,'translate(300, 30)')
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .text('Scroll down to the Scatter Plot of Location within Gene vs Frequency')

        let storySVG2 = d3.select('#storySVG2')
        //storySVG2.attr('width', '150px').attr('height', '50px')
        storySVG2.attr('width', '0px').attr('height', '0px')
        let overlapSVGGroup2 = storySVG2.append('g').attr('id', 'storyGroup2')
        overlapSVGGroup2.append('rect').attr('id','storyTellingOverlapRect2')
            .attr('rx', '12')
            .attr('fill', 'white')
            .attr('stroke', 'black')
            .attr('height', '50')
            .attr('width', '150')
            
        overlapSVGGroup2.append('text').attr('id','storyTellingOverlapText2')
            .attr('transform' ,'translate(75, 30)')
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .text('Keep Scrolling!')         

        let storySVG3 = d3.select('#storySVG3')
        storySVG3.attr('width', '0px').attr('height', '0px')
        //storySVG3.attr('width', '500px').attr('height', '200px')
        let overlapSVGGroup3 = storySVG3.append('g').attr('id', 'storyGroup3')
        overlapSVGGroup3.append('rect').attr('id','storyTellingOverlapRect3')
            .attr('rx', '12')
            .attr('fill', 'white')
            .attr('stroke', 'black')
            .attr('stroke-width', '2px')
            .attr('height', '190')
            .attr('width', '500')
                          
        overlapSVGGroup3.append('text').attr('id','storyTellingOverlapText3')
            .attr('transform' ,'translate(250, 30)')
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .text('The gene ARSA gives a good example of how this ')
        overlapSVGGroup3.append('text').attr('id','storyTellingOverlapText4')
            .attr('transform' ,'translate(250, 50)')
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .text('visualization can help determine if a variant is likely to be ')
        overlapSVGGroup3.append('text').attr('id','storyTellingOverlapText5')
            .attr('transform' ,'translate(250, 70)')
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .text('pathogenic. Notice how many variants are reported in all ')
        overlapSVGGroup3.append('text').attr('id','storyTellingOverlapText6')
            .attr('transform' ,'translate(250, 90)')
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .text('regions of the gene. However, pathogenic and likely')
        overlapSVGGroup3.append('text').attr('id','storyTellingOverlapText7')
            .attr('transform' ,'translate(250, 110)')
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .text('pathogenic variants (red and orange, large circles) are ')
        overlapSVGGroup3.append('text').attr('id','storyTellingOverlapText8')
            .attr('transform' ,'translate(250, 130)')
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .text('present only in the gene body. This indicates that new')
        overlapSVGGroup3.append('text').attr('id','storyTellingOverlapText9')
            .attr('transform' ,'translate(250, 150)')
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .text('variants found in untranslated regions are lilkely ')
        overlapSVGGroup3.append('text').attr('id','storyTellingOverlapText10')
            .attr('transform' ,'translate(250, 170)')
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .text('not going to contribute to disease. ')

    }
    storyTelling(){
        d3.select('#storyButton').on('click', ()=>{
            d3.select('#filters').attr('class', 'button-clicked-misc') 
            d3.select('#overlapFigures').attr('class', 'button-clicked-misc')
            d3.select('#LegendContainer').attr('class', 'LegendContainer button-clicked-misc')
            d3.select('#pathogenicity-graph').attr('class', 'button-clicked-misc')
            d3.select('#geneSelect').attr('class', 'button-clicked-misc')
            d3.select('#frequency-height').attr('class', 'button-clicked-misc')
            d3.select('#invalid').attr('class', 'button-clicked-misc')
            d3.select('#storySVG1').attr('width', '600px').attr('height', '50px')
            d3.select('#storySVG2').attr('width', '150px').attr('height', '50px')
            d3.select('#storySVG3').attr('width', '500px').attr('height', '195px')

            let dropDownValue = "ARSA"
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

            for (let variant of this.MLD_data) {

                if (variant['Gene Symbol'] === dropDownValue && 
                    variant['Position Middle'] >= rangeStart &&
                    variant['Pathogenicity'] != "Not Provided" &&
                    variant['Position Middle'] <= rangeStop) {
                        relevantVariants.push(variant) 
                    }
            }
            for (let variant of relevantVariants) {
                let distanceTss = variant['Position Middle'] - tss 
                if (sense === 'reverse') {
                    distanceTss = -1*distanceTss
                }
                variant['Distance from TSS'] = distanceTss
            }

            let scaleX = d3.scaleLinear()
                .domain([-addDistance,geneLength+addDistance])
                .range([0, this.freqDistance.figure.width]) 
            let scaleY = d3.scaleLinear()
                .domain([6,0])
                .range([0, this.freqDistance.figure.height]) 

            // Draw rectangles for exons 
            d3.select('#geneStructureText').text('Gene Structure')
            d3.select('#exonsLabel').text('Exons') // 
            d3.select('#UTRLabel').text('Untranslated Exons') 
            d3.select('#intronLabel').text('Introns')
            d3.select('#exonsRect').attr('width', '20') 
            d3.select('#UTRRect').attr('width', '20') 
            d3.select('#intronRect').style('stroke-width', 1) 
            let addRectangles = d3.select('#freqDistanceGeneStructure')
                .selectAll('rect')
                .data(this.genomic_features[dropDownValue].exons)
                .join('rect')

            let newRectangles = addRectangles.enter()
                .append('circle')
                .attr('transform', d => {
                    let localY = this.freqDistance.bars.height*0.5-12.5
                    if (d['type'] === "UTR") {
                        localY = this.freqDistance.bars.height*0.5-5
                    }
                    let localX = scaleX(d.start)
                    return 'translate('+localX+','+localY+')'
                }) 
                .attr('width', d => {
                    let localStart = scaleX(d.start)
                    let localStop = scaleX(d.stop)
                    let localWidth = localStop-localStart
                    return localWidth
                })
                .attr('height', d => {
                    if (d['type'] === "UTR") {
                        return 10
                    }
                    return 25
                })

            let mergedRectangles = newRectangles.merge(addRectangles)
                .transition()
                .duration(this.transition_time)
                .attr('transform', d => {
                    let localY = this.freqDistance.bars.height*0.5-12.5
                    if (d['type'] === "UTR") {
                        localY = this.freqDistance.bars.height*0.5-5
                    }
                    let localX = scaleX(d.start)
                    return 'translate('+localX+','+localY+')'
                }) 
                .attr('width', d => {
                    let localStart = scaleX(d.start)
                    let localStop = scaleX(d.stop)
                    let localWidth = localStop-localStart
                    return localWidth
                })
                .attr('height', d => {
                    if (d['type'] === "UTR") {
                        return 10
                    }
                    return 25
                })

            d3.select('#tssToTtsLine')
                .attr('x1', scaleX(0))
                .attr('x2', scaleX(geneLength))

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

            d3.select('#freqDistancePlotYAxisLabel').text('-Log base 10 Minor Allele Frequency')
            d3.select('#freqDistancePlotXAxisLabel').text('Distance from Transcription Start Site (TSS)')
            d3.select('#frequency-distance-text')
                .text('')
            let scatterCircles = d3.select('#freqDistancePlotSection')
                .selectAll('circle')
                .data(relevantVariants)
                .join('circle')


            let circleRadius = 5
            let newCircles = scatterCircles.enter().append('circle')
                .attr('cx', d => scaleX(d['Distance from TSS'])) // 0.5*this.freqDistance.figure.width
                .attr('cy', d => scaleY(d['Frequency Position'])) // 0.5*this.freqDistance.figure.height
                .attr('r', d => {if (d['Pathogenicity'] === "Pathogenic" || d['Pathogenicity'] === "Likely Pathogenic") {
                    return 7
                    } 
                    else {
                        return circleRadius
                    }
                })
                .attr('opacity', d => {if (d['Pathogenicity'] === "Pathogenic" || d['Pathogenicity'] === "Likely Pathogenic") {
                    return 1
                    } 
                    else {
                        return 0.4
                    }
                })
                .attr('class', d => classDict[d['Pathogenicity']])
                .style('stroke-width', d => {if (d['Pathogenicity'] === "Pathogenic" || d['Pathogenicity'] === "Likely Pathogenic") {
                    return 1
                    } 
                    else {
                        return 0
                    }
                })
                .style('stroke', d => {if (d['Pathogenicity'] === "Pathogenic" || d['Pathogenicity'] === "Likely Pathogenic") {
                    return 'black'
                    } 
                    else {
                        return 'none'
                    }
                })

            let mergedCircles = newCircles.merge(scatterCircles)
                .transition()
                .duration(this.transition_time)
                .attr('cx', d => scaleX(d['Distance from TSS']))
                .attr('cy', d => scaleY(d['Frequency Position']))
                .attr('r', d => {if (d['Pathogenicity'] === "Pathogenic" || d['Pathogenicity'] === "Likely Pathogenic") {
                    return 7
                    } 
                    else {
                        return circleRadius
                    }
                })
                .attr('opacity', d => {if (d['Pathogenicity'] === "Pathogenic" || d['Pathogenicity'] === "Likely Pathogenic") {
                    return 1
                    } 
                    else {
                        return 0.4
                    }
                })
                .attr('class', d => classDict[d['Pathogenicity']])
                .style('stroke-width', d => {if (d['Pathogenicity'] === "Pathogenic" || d['Pathogenicity'] === "Likely Pathogenic") {
                    return 1
                    } 
                    else {
                        return 0
                    }
                })
                .style('stroke', d => {if (d['Pathogenicity'] === "Pathogenic" || d['Pathogenicity'] === "Likely Pathogenic") {
                    return 'black'
                    } 
                    else {
                        return 'none'
                    }
                })


            //console.log('button was clicked')
        })

    }
    resetStoryBoard() {

        d3.select('body').on('click', ()=>{
            d3.select('#filters').classed('button-clicked-misc', false)
            d3.select('#overlapFigures').classed('button-clicked-misc', false)
            d3.select('#LegendContainer').attr('class', 'LegendContainer')
            d3.select('#pathogenicity-graph').classed('button-clicked-misc', false)
            d3.select('#geneSelect').classed('button-clicked-misc', false)
            d3.select('#frequency-height').classed('button-clicked-misc', false)
            d3.select('#invalid').classed('button-clicked-misc', false)
            d3.select('#freqDistancePlotSection').selectAll('circle')
                .attr('opacity', '0.4')
                .style('stroke-width', '0')
                .style('stroke', 'none')

            d3.select('#storySVG1').attr('width', '0px').attr('height', '0px')
            d3.select('#storySVG2').attr('width', '0px').attr('height', '0px')
            d3.select('#storySVG3').attr('width', '0px').attr('height', '0px')
           
            this.redraw()
        }, true)

        
    }
    
    
}

 


            
            