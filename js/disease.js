const stackedByPercent = (data)=>{
    const dataBYGene = {}
    data.forEach((d)=>{
        if(dataBYGene[d.geneSymbol]){
            dataBYGene[d.geneSymbol].push(d)

        }else{
            dataBYGene[d.geneSymbol]= [d]
        }

    })
    console.log(dataBYGene)

    const dataToPlot = {}
    Object.keys(dataBYGene).forEach((gene)=>{
        dataToPlot[gene]=[]
        const LOVDLength = dataBYGene[gene].filter((d)=>{
            return d.isLOVD && !d.isClinVar 

        }).length
        dataToPlot[gene].push([LOVDLength, gene])

        const BothLength = dataBYGene[gene].filter((d)=>{
            return d.isLOVD && d.isClinVar 

        }).length
        dataToPlot[gene].push([BothLength, gene])

        const ClinVarLength = dataBYGene[gene].filter((d)=>{
            return !d.isLOVD && d.isClinVar 

        }).length
        dataToPlot[gene].push([ClinVarLength, gene])
    })
    console.log(dataToPlot)
    const margin = {
        top: 10,
        left:30,
        right:0,
        bottom:25
    }
// hex colors 0,6,2

    const colorArray = [d3.schemeTableau10[0],d3.schemeTableau10[6],d3.schemeTableau10[2]]
    const height = 500-margin.top-margin.bottom
    const width = 500-margin.right-margin.left

   countPlot(dataToPlot, dataBYGene, width, height, margin, colorArray)

        const svg = d3.selectAll("#percentOverlapPlot")
        .attr("width", 500)
        .attr("height", 500)
        const x = d3.scaleBand()
            .domain(Object.keys(dataToPlot))
            .range([0, width])
            
        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0])
    

        const xAxisG = svg.selectAll(".x-axis")
       if(xAxisG.empty()){
        svg.append("g").call(d3.axisBottom(x))
        .attr("transform", `translate(${margin.left}, ${height+margin.top})`)
        .attr('class', "x-axis")
       }else{
           xAxisG.transition().duration(1000).call(d3.axisBottom(x))
       }

       const yAxisG = svg.selectAll(".y-axis")
       if(yAxisG.empty()){
        svg.append("g").call(d3.axisLeft(y))
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .attr('class', "y-axis")
       }else{
           yAxisG.transition().duration(1000).call(d3.axisLeft(y))
       }
        
        const barWidth = 50
        const barPlotPadding = (width/Object.keys(dataToPlot).length - barWidth)/2

        const gs = svg.selectAll(".bar")
        .data(Object.keys(dataToPlot)).join(
            (enter)=>{
                const returnVal = enter.append("g")
                .attr("transform", (d)=>{
                    return `translate(${x(d)+margin.left+barPlotPadding},${y(100)+margin.top})`
        
                }) 
                .attr('class', "bar")
                return returnVal
            },
            (update)=>{
                update.attr("transform", (d)=>{
                    return `translate(${x(d)+margin.left+barPlotPadding},${y(100)+margin.top})`
        
                })
                return update
            }

        )
        
       

        gs.selectAll("rect")
       .data((d)=>{
                console.log(d)
                console.log(dataToPlot[d])
                console.log(dataBYGene)
                const max = dataBYGene[d].length
                return dataToPlot[d].map((dInner)=>{
                    return [(dInner[0]/max) *100, dInner[1]]

                })
            }).join(
                (enter)=>{
                    const rect = enter.append("rect")
                    .attr("x", 0)
                    .attr("y", (d,i,o)=>{
                        console.log(d)
                        console.log(i)
                        console.log(o)
                      let yCoord = 0
                      for(let j = 0;j<i;j++){
                          console.log("getting here")
                          console.log(dataToPlot[d[1]])
                          const max = dataBYGene[d[1]].length
                          yCoord += height - y(dataToPlot[d[1]][j][0]/max *100)
                      }
                      console.log(yCoord)
                       return yCoord 
                    })
                    .attr("width", barWidth)
                    .attr("height", (d)=>{
        
                        return height - y(d[0])
                    })
                    .attr("fill", (d, i)=>{
                        return colorArray[i]
                    })
                    return rect
                },
                (update)=>{
                    console.log(update)
                    update.transition().duration(1000).attr("x", 0)
                    .attr("y", (d,i,o)=>{
                        console.log(d)
                        console.log(i)
                        console.log(o)
                      let yCoord = 0
                      for(let j = 0;j<i;j++){
                          console.log("getting here")
                          console.log(dataToPlot[d[1]])
                          const max = dataBYGene[d[1]].length
                          yCoord += height - y(dataToPlot[d[1]][j][0]/max *100)
                      }
                      console.log(yCoord)
                       return yCoord 
                    })
                    .attr("width", barWidth)
                    .attr("height", (d)=>{
        
                        return height - y(d[0])
                    })
                    .attr("fill", (d, i)=>{
                        return colorArray[i]
                    })
                    return update
                }
    
            )

    

}

function countPlot(dataToPlot, dataBYGene, width, height, margin, colorArray){
    const svg = d3.selectAll("#countOverlapPlot")
    .attr("width", 500)
    .attr("height", 500)
    const x = d3.scaleBand()
        .domain(Object.keys(dataToPlot))
        .range([0, width])
        const maxY = Math.max(...Object.keys(dataBYGene).map((gene)=>{
            return dataBYGene[gene].length
        }))
    const y = d3.scaleLinear()
        .domain([0, maxY])
        .range([height, 0])
       const xAxisG = svg.selectAll(".x-axis")
       if(xAxisG.empty()){
        svg.append("g").call(d3.axisBottom(x))
        .attr("transform", `translate(${margin.left}, ${height+margin.top})`)
        .attr('class', "x-axis")
       }else{
           xAxisG.transition().duration(1000).call(d3.axisBottom(x))
       }

       const yAxisG = svg.selectAll(".y-axis")
       if(yAxisG.empty()){
        svg.append("g").call(d3.axisLeft(y))
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .attr('class', "y-axis")
       }else{
           yAxisG.transition().duration(1000).call(d3.axisLeft(y))
       }
    
    const barWidth = 50
    const barPlotPadding = (width/Object.keys(dataToPlot).length - barWidth)/2

    const gs = svg.selectAll(".bar")
    .data(Object.keys(dataToPlot)).join(
        (enter)=>{
            const returnVal = enter.append("g")
            .attr("transform", (d)=>{
                return `translate(${x(d)+margin.left+barPlotPadding},${y(dataBYGene[d].length)+margin.top})`
        
            })
            .attr("class", "bar")
            return returnVal
        },
        (update)=>{
            update.transition().duration(1000).attr("transform", (d)=>{
                return `translate(${x(d)+margin.left+barPlotPadding},${y(dataBYGene[d].length)+margin.top})`
        
            }) 
            return update
        }
    )


    gs.selectAll("rect")
   .data((d)=>{
            console.log(d)
            return dataToPlot[d]
        }).join(
            (enter)=>{
                const returnVal = enter.append("rect")
                .attr("x", 0)
                .attr("y", (d,i,o)=>{
                    console.log(i)
                    console.log(o)
                  let yCoord = 0
                  for(let j = 0;j<i;j++){
                      console.log("getting here")
                      console.log(dataToPlot[d[1]])
                      yCoord += height - y(dataToPlot[d[1]][j][0])
                  }
                  console.log(yCoord)
                   return yCoord 
                })
                .attr("width", barWidth)
                .attr("height", (d)=>{
        
                    return height - y(d[0])
                })
                .attr("fill", (d, i)=>{
                    return colorArray[i]
                })
            },
            (update)=>{
                update.transition().duration(1000)
                .attr("x", 0)
                .attr("y", (d,i,o)=>{
                    console.log(i)
                    console.log(o)
                  let yCoord = 0
                  for(let j = 0;j<i;j++){
                      console.log("getting here")
                      console.log(dataToPlot[d[1]])
                      yCoord += height - y(dataToPlot[d[1]][j][0])
                  }
                  console.log(yCoord)
                   return yCoord 
                })
                .attr("width", barWidth)
                .attr("height", (d)=>{
        
                    return height - y(d[0])
                })
                .attr("fill", (d, i)=>{
                    return colorArray[i]
                })
            }
        )


}

d3.csv('./data/MLD_Valid.csv').then(function(data){
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

    d3.select('#checkBoxClinVar').on('change', (event) => {
        this.filters['databases']['ClinVar'] = event.target.checked

    })
    d3.select('#checkBoxGlob').on('change', (event) => {
        this.filters['databases']['Global_Variome'] = event.target.checked
    })
    d3.select('#checkBoxHum').on('change', (event) => {
        this.filters['databases']['Human_Variome'] = event.target.checked
    })
    d3.select('#checkBoxBIPSNP').on('change', (event) => {
        this.filters['databases']['BIPmed_SNPhg19'] = event.target.checked
    })
    d3.select('#checkBoxBIPWES').on('change', (event) => {
        this.filters['databases']['BIPmed_WES'] = event.target.checked
    })
    d3.select('#checkBoxMSEQ').on('change', (event) => {
        this.filters['databases']['MSeqDR-LSDB'] = event.target.checked
    })
    d3.select('#checkBoxCCHMC').on('change', (event) => {
        this.filters['databases']['CCHMC'] = event.target.checked
    })

    // This was the way to use the DOM instead of d3 
    // let globButton = document.getElementById('checkBoxGlob')
    // globButton.addEventListener('change', (event) => {
    //     this.filters['databases']['Global_Variome'] = event.target.checked
    // })

    // Now for variant type
    d3.select('#checkBoxSNV').on('change', (event) => {
        this.filters['varType']['single nucleotide variant'] = event.target.checked
    })
    d3.select('#checkBoxDel').on('change', (event) => {
        this.filters['varType']['Deletion'] = event.target.checked
    })
    d3.select('#checkBoxDup').on('change', (event) => {
        this.filters['varType']['Duplication'] = event.target.checked
    })
    d3.select('#checkBoxIns').on('change', (event) => {
        this.filters['varType']['Insertion'] = event.target.checked
    })
    d3.select('#checkBoxIndel').on('change', (event) => {
        this.filters['varType']['Indel'] = event.target.checked
    })

    // Now for pathogenicity
    d3.select('#checkBoxBenign').on('change', (event) => {
        this.filters['pathogenicity']['Benign'] = event.target.checked
    })
    d3.select('#checkBoxLikBenign').on('change', (event) => {
        this.filters['pathogenicity']['Likely Benign'] = event.target.checked
    })
    d3.select('#checkBoxVUS').on('change', (event) => {
        this.filters['pathogenicity']['VUS'] = event.target.checked
    })
    d3.select('#checkBoxLikPath').on('change', (event) => {
        this.filters['pathogenicity']['Likely Pathogenic'] = event.target.checked
    })
    d3.select('#checkBoxPath').on('change', (event) => {
        this.filters['pathogenicity']['Pathogenic'] = event.target.checked
    })
    d3.select('#checkBoxCon').on('change', (event) => {
        this.filters['pathogenicity']['Conflicting'] = event.target.checked
    })
    d3.select('#checkBoxNotPro').on('change', (event) => {
        this.filters['pathogenicity']['Not Provided'] = event.target.checked
    })

    // Now for Review Status
    d3.select('#checkBoxReview0').on('change', (event) => {
        this.filters['reviewStatus']['0'] = event.target.checked
    })
    d3.select('#checkBoxReview1').on('change', (event) => {
        this.filters['reviewStatus']['1'] = event.target.checked
    })
    d3.select('#checkBoxReview2').on('change', (event) => {
        this.filters['reviewStatus']['2'] = event.target.checked
    })
    console.log(data)

    reDrawBarPlots(data, this.filters)


    // redraw button
     let redrawButton = d3.select('#redraw-button')
     redrawButton.on('click', ()=>{
         reDrawBarPlots(data, this.filters)
     })
 

})

function reDrawBarPlots(data, filters){
    data = data.filter((d)=>{
        if(!filters['databases'][d.Database]){
         console.log(d)
         return false
        } 
        if(!filters['varType'][d["Variant Type"]]){
         console.log(d)
         return false
     }
     if(!filters['pathogenicity'][d["Pathogenicity"]]){
         console.log(d)
         return false
     }
 
     if(!filters['reviewStatus'][d["Star Level"]]){
         console.log(d)
         return false
     }
     return true
 
    })
 
     
     data = data.map((d)=>{
         return {
             geneSymbol:d["Gene Symbol"],
             HGVS:d["HGVS Normalized Genomic Annotation"],
             isClinVar:d["Database"]==="ClinVar",
             disease:d["Disease"],
             isLOVD:d["Database"]!=="ClinVar"
 
         }
 
     })
     console.log(data)
     const currentDisease = "Metachromatic Leukodystrophy"
     const datafordisease = data.filter((d)=>{
         return d.disease === currentDisease
     })
 
     const uniqueHGVSData = []
     datafordisease.forEach((d)=>{
         const existingHGVSData = uniqueHGVSData.find(
             (dInner)=>{
                 return dInner.HGVS===d.HGVS
             }
         )
         if (existingHGVSData){
             if(d.isClinVar){
                 existingHGVSData.isClinVar= true
             }
             if(d.isLOVD){
                 existingHGVSData.isLOVD=true
             }
         }else{
             uniqueHGVSData.push(d)
         }
     })
     console.log(datafordisease)
     console.log(uniqueHGVSData)
     stackedByPercent(uniqueHGVSData)
}


