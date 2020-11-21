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
            '2': true
        }}
        
        this.eventListeners()
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
        


    }

    pathogenicityGraph(){

        // first set up the data 
        let pathogenicityClasses = ['Benign', 'Likely Benign', 'VUS', 
        'Likely Pathogenic', 'Pathogenic', 'Conflicting', 'Not Provided']

        let gene_symbols = ['ARSA', 'PSAP', 'SUMF1']

        // only include pathogenicity classes that are selected in the page
        let includedClasses = []

        for (let i of Object.entries(this.filters.pathogenicity)){
            if (i[1]){
                includedClasses.push(i[0])
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

            // check that the pathogenicity is selected on the page
            if (includedClasses.includes(pathogenicity)){

                // now we want to check which pathogenicity it is, and make sure the 
                // HGVS normalized genomic annotation isn't already in the list to avoid duplicates
                if (pathogenicity === 'Benign' && !benign_list.includes(hgvs)){
                    benign_list.push({'HGVS': hgvs, 'gene_symbol': gene_symbol})
                }

                else if (pathogenicity === 'Likely Benign' && !likely_benign_list.includes(hgvs)){
                    likely_benign_list.push({'HGVS': hgvs, 'gene_symbol': gene_symbol})
                }

                else if (pathogenicity === 'VUS' && !vus_list.includes(hgvs)){
                    vus_list.push({'HGVS': hgvs, 'gene_symbol': gene_symbol})
                }

                else if (pathogenicity === 'Likely Pathogenic' && 
                !likely_pathogenic_list.includes(hgvs)){
                    likely_pathogenic_list.push({'HGVS': hgvs, 'gene_symbol': gene_symbol})
                }

                else if (pathogenicity === 'Pathogenic' && !pathogenic_list.includes(hgvs)){
                    pathogenic_list.push({'HGVS': hgvs, 'gene_symbol': gene_symbol})
                }
            
                else if (pathogenicity === 'Conflicting' && !conflicting_list.includes(hgvs)){
                    conflicting_list.push({'HGVS': hgvs, 'gene_symbol': gene_symbol})
                }

                else if (pathogenicity === 'Not Provided' && !not_provided_list.includes(hgvs)){
                    not_provided_list.push({'HGVS': hgvs, 'gene_symbol': gene_symbol})
                }

            }
            
        }

        // now, determine the total count of all the pathogenicity classes

        let all_lists = [benign_list, likely_benign_list, vus_list, 
            likely_pathogenic_list, pathogenic_list, conflicting_list, 
            not_provided_list]

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


        // set up the svg
        let svg_width = 600
        let svg_height = 400
        let margins = {left: 50, top: 30}

        let pathogenicityGraphSVG = d3.select('#pathogenicity-graph').append('svg')
            .attr('width', svg_width)
            .attr('height', svg_height)
            .attr('id', 'pathogenicity-svg')

        // define scales
        let scaleX = d3.scaleBand()
            .domain(pathogenicityClasses)
            .range([0, svg_width - margins.left])


        let scaleY = d3.scaleLinear()
            .domain([1, 0])
            .range([0, svg_height])

        // set up axes
        let y_axis = d3.axisLeft(scaleY)
            .ticks(4)

        let colorScale = d3.scaleOrdinal()
            .domain(pathogenicityClasses)
            .range(['red', 'blue', 'green'])

        
        let x_axis = d3.axisBottom(scaleX)
            .ticks(8)
            .tickFormat((d,i)=>pathogenicityClasses[i])

        
        let y_axis_group = pathogenicityGraphSVG.append('g')
            .attr('id', 'pathogenicity-y-axis')
            .call(y_axis)
            .attr('transform', `translate(${margins.left}, ${-margins.top})`)
        
        let x_axis_group = pathogenicityGraphSVG.append('g')
            .attr('id', 'pathogenicity-x-axis')
            .call(x_axis)
            .attr('transform', `translate(${margins.left}, ${svg_height - margins.top})`)
        
        // draw the graph

        // set transition duration time
        let duration = 2000

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
        d3.select('#ASRA-group').selectAll('circle')
            .data(percentages_data[0])
            .join(
                enter => {enter.append('circle')
                    .attr('r', radius)
                    .attr('cx', d=>scaleX(d.pathogenicity))
                    .attr('cy', d=>scaleY(d.value))
                    .style('fill', 'red')
                    .transition()
                        .duration(duration)

                },
                update=>{update.transition()
                    .duration(duration)
                    .attr('r', radius)
                    .attr('cx', d=>scaleX(d.pathogenicity))
                    .attr('cy', d=>scaleY(d.value))
                    .style('fill', 'red')
                },
                exit=>{exit.transition()
                    .duration(duration)
                }
            )

        d3.select('#PSAP-group').selectAll('circle')
            .data(percentages_data[1])
            .join(
                enter => {enter.append('circle')
                    .attr('r', radius)
                    .attr('cx', d=>scaleX(d.pathogenicity))
                    .attr('cy', d=>scaleY(d.value))
                    .style('fill', 'blue')
                    .transition()
                        .duration(duration)

                },
                update=>{update.transition()
                    .duration(duration)
                    .attr('r', radius)
                    .attr('cx', d=>scaleX(d.pathogenicity))
                    .attr('cy', d=>scaleY(d.value))
                    .style('fill', 'blue')
                },
                exit=>{exit.transition()
                    .duration(duration)
                }
            )

        d3.select('#SUMF1-group').selectAll('circle')
            .data(percentages_data[2])
            .join(
                enter => {enter.append('circle')
                    .attr('r', radius)
                    .attr('cx', d=>scaleX(d.pathogenicity))
                    .attr('cy', d=>scaleY(d.value))
                    .style('fill', 'green')
                    .transition()
                        .duration(duration)

                },
                update=>{update.transition()
                    .duration(duration)
                    .attr('r', radius)
                    .attr('cx', d=>scaleX(d.pathogenicity))
                    .attr('cy', d=>scaleY(d.value))
                    .style('fill', 'green')
                },
                exit=>{exit.transition()
                    .duration(duration)
                }
            )

        // add y-axis label
        d3.select('#pathogenicity-svg').append('text')
            .text('Proportion')
            .style('text-anchor', 'middle')
            .attr('y', 12)
            .attr('x', -200)
            .attr('transform', 'rotate(-90)')


    }
    
    redraw(){
    
        
    }
    

}


