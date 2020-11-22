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

        console.log(MLD_data)
        // console.log(genomic_features)
        // console.log(invalid_data)

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
        //this.freqDistance.margin.top = 0
        this.freqDistance.axis = {}
        this.freqDistance.axis.left = 30
        this.freqDistance.axis.bottom = 30
        //this.freqDistance.margin.bottom = 20
        this.freqDistance.figure = {}
        this.freqDistance.figure.height = 400
        this.freqDistance.figure.width = 750
        this.freqDistance.legend = {}
        this.freqDistance.legend.width = 200
        this.freqDistance.bars = {}
        this.freqDistance.bars.height = 100
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
            // .append('text').text('something')
        
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

        // this line other one
        freqDistanceSVG.append('g')
            .attr('id', 'freqDistanceInfoBox')
            .attr("transform", "translate("+axisStartLeft+","+this.freqDistance.margin.top+")")

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
            //.call(y_axis)
            .attr('transform', `translate(${margins.left}, ${-margins.top})`)
        
        let x_axis_group = pathogenicityGraphSVG.append('g')
            .attr('id', 'pathogenicity-x-axis')
            //.call(x_axis)
            .attr('transform', `translate(${margins.left}, ${svg_height - margins.top})`)

        d3.select('#pathogenicity-svg').append('text')
            .text('Proportion')
            .style('text-anchor', 'middle')
            .attr('y', 12)
            .attr('x', -180)
            .attr('transform', 'rotate(-90)')

        //let svg = d3.select("#pathogenicity-svg")
        let radius = 6
        pathogenicityGraphSVG.append('circle')
            .attr('cx', 500)
            .attr('cy', 42)
            .attr('r', radius)
            .style('fill', 'red')

        
        pathogenicityGraphSVG.append('circle')
            .attr('cx', 500)
            .attr('cy', 62)
            .attr('r', radius)
            .style('fill', 'blue')

        pathogenicityGraphSVG.append('circle')
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
        // console.log(this.diseases)
        // console.log(this.genes)
 


    }
    eventListeners() {
        //let clinVarButton = 
        d3.select('#checkBoxClinVar').on('change', (event) => {
            this.filters['databases']['ClinVar'] = event.path[0].checked
            // console.log(this.filters)
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

        // redraw button
        let redrawButton = d3.select('#redraw-button')
        redrawButton.on('click', ()=>{
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
            //d3.select('#freqDistancePlotLabel').selectAll('text').style('font-size', '0px')
            //d3.select('#freqDistancePlotLabel').selectAll('circle').attr('r', '0')
        }
        else {
            //find TSS and TTS to filter out relevant variants
            //d3.select('#freqDistancePlotLabel').selectAll('text').style('font-size', '16px')
            //d3.select('#freqDistancePlotLabel').selectAll('circle').attr('r', '7')

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
            //keepStatus.push('-') // LOVD does not have a star status

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
            //console.log(relevantVariants)
// this line
            // this.freqDistance.margin = {}
            // this.freqDistance.margin.top = 20
            // this.freqDistance.margin.left = 15
            // this.freqDistance.margin.right = 10
            // this.freqDistance.margin.bottom = 20
            // //this.freqDistance.margin.top = 0
            // this.freqDistance.axis = {}
            // this.freqDistance.axis.left = 30
            // this.freqDistance.axis.bottom = 30
            // //this.freqDistance.margin.bottom = 20
            // this.freqDistance.figure = {}
            // this.freqDistance.figure.height = 400
            // this.freqDistance.figure.width = 750
            // this.freqDistance.legend = {}
            // this.freqDistance.legend.width = 200
            // this.freqDistance.bars = {}
            // this.freqDistance.bars.height = 100

            let scaleX = d3.scaleLinear()
                .domain([-addDistance,geneLength+addDistance])
                .range([0, this.freqDistance.figure.width]) // use 30 for legend left, 20 for space right
            let scaleY = d3.scaleLinear()
                .domain([6,0])
                .range([0, this.freqDistance.figure.height]) // use 50 for legend
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

            d3.select('#freqDistancePlotYAxisLabel').text('-Log base 10 Minor Allele Frequency')
            d3.select('#freqDistancePlotXAxisLabel').text('Distance from Transcription Start Site (TSS)')
            d3.select('#frequency-distance-text')
                .text('')
            let scatterCircles = d3.select('#freqDistancePlotSection')
                .selectAll('circle')
                .data(relevantVariants)
                .join('circle')

                //this.freqDistance.figure.width
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
//this line
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

                let freqDistanceHoverBoxText = d3.select('#freqDistanceHoverBoxText')
                    .text('')

                })

        // let freqDistanceHoverBox = freqDistanceSVG.append('g')
        //     .attr('id', 'freqDistanceHoverBox')

        // freqDistanceHoverBox.append('rect')
        //     .attr('width', this.freqDistance.hover.width)
        //     .attr('height', this.freqDistance.hover.height)
        //     .attr('rx', '5') // curvature line
        //     .attr('fill', 'none')

        // freqDistanceHoverBox.append('text')
        //     .attr('id', 'freqDistanceHoverBoxText')
        //     .attr('x', (this.freqDistance.hover.width/2))
        //     .attr('y', 30)
        //     .attr('text-anchor', 'middle')
        //     .style('font-size', '12')

                //this line 3

                // all_lines.on('mouseover', event=>{
                //     d3.select(event.target)
                //         .classed('hovered', true)
                //         .classed('not-hovered', false)
                // })
                //     .on('mouseout', event=>{
                //         d3.select(event.target)
                //         .classed('hovered', false)
                //         .classed('not-hovered', true)
                //     })
        }
        //console.log(dropDownValue)
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
        }

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
        // let pathogenicityGraphSVG = d3.select('#pathogenicity-graph').append('svg')
        //     .attr('width', svg_width)
        //     .attr('height', svg_height)
        //     .attr('id', 'pathogenicity-svg')

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
            d3.select(event.target)
                .classed('hovered', true)
                .classed('not-hovered', false)
        })
            .on('mouseout', event=>{
                d3.select(event.target)
                    .classed('hovered', false)
                    .classed('not-hovered', true)
            })
        
    }
    
    updateWithGene(){
        d3.select('#dropdownMenu').on('change', d => this.drawDistanceTSSScatter())
    }

    redraw(){
       this.pathogenicityGraph()
       this.drawDistanceTSSScatter()
    }
    

}


