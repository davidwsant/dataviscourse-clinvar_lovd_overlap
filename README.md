
# **Data Visualization CS - 5630/ CS - 6630 Final Project**

### Basic Info

|   	| Member 1| Member 2| Member 3|
|---	|---	|---	|---	|
|Name|David Sant|Dallon Durfey|Marcus Stucki|
|Email|david.sant@utah.edu|dallon.durfey@utah.edu|marcus.stucki@hsc.utah.edu|
|UID|u0454956|u01275125|u0420655|

Project Title: Investigating Overlap and Segregation of Variants between ClinVar and LOVD Databases

GitHub Repository: https://github.com/davidwsant/dataviscourse-clinvar_lovd_overlap 

### Background and Motivation

Any two unrelated individuals will have approximately 0.1% difference in their genetic code.<sup>1,2</sup> Most of these differences are inherited while a small number arise every generation, known as de novo mutations. These differences are important as they (along with our experiences in life) contribute to our individuality. Simply put, they help make us who we are. 

Unfortunately, some genetic variations can lead to changes in gene expression or alterations in the function of a gene, which can lead to phenotypic changes, including disease.<sup>3</sup> Many clinical studies and research studies focus on determining the genetic variation behind a disease. Finding the genetic cause of a disease can help inform a diagnosis, confirm a diagnosis, identify reproductive risks, guide treatment and contribute to further knowledge about a disease.<sup>4</sup>  

Once genetic testing is performed, determining the pathogenicity of specific variants can be quite difficult considering that very few variants have been established by expert committees to directly cause disease. Furthermore, whole genome sequencing (WGS) and whole exome sequencing (WES) typically return several thousand variants that are rare in the general population. Even targeted panels may return dozens of variants that are predicted to alter protein function in relevant genes. 

The American College of Medical Genetics (ACMG) and the Association for Molecular Pathology (AMP) have established a set of criteria for determining if variants are pathogenic or benign. One of those criteria is to determine if the variant has been reported as associated with a disease in a reputable clinical genetic database.<sup>5</sup> The National Center for Biotechnology Information hosts a database called ClinVar which contains information about hundreds of thousands of genetic variants. Submitters come from many countries and this is the predominant clinical genetic database used by many diagnostic groups around the world, including most clinical genetics groups in the United States.<sup>6</sup> Another set of databases with a similar goal has been established in Europe, collectively known as the Leiden Open Variant Database (LOVD).<sup>5</sup> Rather than allowing anyone to submit variant information to a single database, the LOVD group has chosen to instead allow users to create their own database built upon the LOVD platform, so several dozen LOVD databases are currently in use. The predominant LOVD databases are currently maintained by the members of the Human Variome Project.<sup>8</sup> 


While clinical genetic information is contained in both ClinVar and the LOVD databases, many clinical groups in the United States tend to only look to see if variants have been reported in ClinVar. This is likely because ClinVar is far more well known in the United States and all of the information is obtained from a single database. LOVD, on the other hand, is not as well known and requires searching several databases and therefore requires significantly more time. Additionally, not all LOVD databases contain information about variant pathogenicity. Furthermore, many clinical geneticists and genetic counselors are not aware that many variants in LOVD are not contained in ClinVar. 


Over the summer David Sant worked with the Utah Department of Health (UDOH) to create a series of python scripts to obtain variant information for variants in specific genes from both ClinVar and LOVD databases. The genes chosen were all related to diseases on the UDOH newborn screening (NBS) panel. The project involved only obtaining information about the variants (including reported pathogenicity) and normalizing the variant annotations to Human Genome Variation Society (HGVS) format. The project involved no visualization aside from several bar charts generated using python. The visualizations that will be used for this project are all new. The code for obtaining the variants can be found on the Eilbeck lab GitHub page: https://github.com/eilbecklab/Utah-DOH-newborn-screening. 


### Project Objectives

The primary objective of this project is to visualize the overlap and segregation of variants between ClinVar and LOVD. When working with the genetic counselors last summer, it was found that LOVD was generally thought to contain essentially no variants that were unique from ClinVar. Out of the 55 genes investigated for the NBS panels, only 17% of the total variants were found both in ClinVar and at least one LOVD database. We would like this project to show that there is minimal overlap and that some genes have more variant information in LOVD websites than ClinVar.


We would like to add some information to the visualization. The frequency of a variant within the population is an important factor to consider when determining if a variant is pathogenic. This information has not been added, but we hope to add a script to include gnomAD frequency information to the variants.<sup>10</sup> This will help us visualize where in the genes the variants are rare or common.

We would also like to visualize the regions of genes where variants are reported. It is well known that certain domains within proteins may cause damages when mutated while others are very resilient. We would like to visualize the location of variants within the genes. This visualization, along with the visualization of the frequency of variants, will help us visually see which regions of the gene are more likely to harbor pathogenic mutations.

Additionally, we would like to visualize information about the variants that could not be normalized to HGVS using the biocommons software.<sup>11</sup> ClinVar is famous for containing large numbers of variants, but a surprisingly large number of variants within ClinVar have no genetic information or information that cannot be normalized. We would like to show the discrepancy between ClinVar and LOVD with regard to the variants that cannot be normalized automatically.

### Data

The data for this will come from ClinVar and from six LOVD databases. The LOVD databases that will be included are Global Variome shared LOVD (https://www.lovd.nl/), Human Variome Project (http://proteomics.bio21.unimelb.edu.au/lovd/genes), Mitochondrial Disease Locus Specific Database (MSeqDR-LSDB, https://mseqdr.org/MITO/genes), Brazilian Initiative on Precision Medicine (BIPmed) SNP array database (http://bipmed.iqm.unicamp.br/snparray_hg19/genes), the BIPmed whole exome sequencing database (http://bipmed.iqm.unicamp.br/wes_hg19/genes/) and the Cincinnati Children’s Hospital Medical Center (CCHMC) database. Genes from three disease categories will be used, Metachromatic Leukodystrophy (MLD), Metabolic Diseases (includes several diseases, but all are metabolic in nature) and Severe Combined Immunodeficiency (SCID). MLD and the metabolic disease genes are the only ones known to be associated with the given diseases, and associations are very clear. SCID is less well understood genetically, so we chose to use the New York NBS panel list of 39 genes. The genes per disease are as follows: 


Metachromatic Leukodystrophy (MLD): ARSA, PSAP and SUMF1
Metabolic Diseases: ACADM, ACADS, ACADVL, CPT1A, CPT2, ETFA, ETFB, ETFDH, HADH, HADHA, HADHB, SLC22A5, SLC25A20
Severe Combined Immunodeficiency (SCID): CORO1A, CD247, ATM, LIG4, DOCK2, PRKDC, DCLRE1C, CHD7, NHEJ1, GATA2, TBX1, IL2RG, MTHFD1, RAC2, IGHM, ADA, IL7R, MTR, CD3G, BTK, AK2, JAK3, RMRP, STAT5B, CD40LG, CD3D, RAG1, SLC46A1, ZAP70, WAS, CD3E, RAG2, DOCK8, PNP, DKC1, PTPRC, FOXN1, NBN, BLNK

### Data Processing

Obtaining and cleaning the data will take significant work. The data will be processed using the python scripts in the project directory in the Eilbeck lab GitHub page: https://github.com/eilbecklab/Utah-DOH-newborn-screening. The variant information from ClinVar will be parsed from the XML file that can be found on their FTP directory:  ftp://ftp.ncbi.nlm.nih.gov/pub/clinvar/xml/ The variant information from the LOVD version 3 databases (all except CCHMC) will be obtained through web scraping pages with tables containing the variant information. The CCHMC website is still in LOVD version 2 format and must be scraped one page per variant entry. All information is saved in csv format. The scripts will obtain the variant information and normalize all variants to HGVS format. Variants that cannot be normalized automatically will be stored in separate files. We plan to write a bash script to parse the gnomAD variant call format (vcf) file to obtain frequency information. We also plan to write a python script to put the information into a SQLite database so that it can take less space and be parsed more easily. 

### Visualization Design

On page load the page will show a stacked bar chart showing the percentage of variants per disease that are in both ClinVar and LOVD databases, ClinVar only or LOVD only.

![image1.png](attachment:image1.png)

There will be a button to tell the figure to switch from percentage to total variants.

![image2.png](attachment:image2.png)

![image3.png](attachment:image3.png)

On page load we would also like a dropdown menu to be present to allow the user to select which disease’s information will be shown. The options are currently MLD, Metabolic Diseases and SCID.

![image4.png](attachment:image4.png)

After choosing a disease, stacked bar charts will show the overlap between ClinVar and LOVD databases per gene.

![image5.png](attachment:image5.png)

Similar to the stacked bar chart for disease, this one will have a button to click and switch to total variants instead of percentage of variants. 

![image6.png](attachment:image6.png)

In addition to these graphs, another set of stacked bar charts could be used to show what type of variants these are.

This, like the other bar charts, could be changed to percentage rather than total counts. 


Along with drawing these, there would also be options for filtering the data. By default, it will show information about all of the variants. I would like the viewer to be able to select the filter based on several criteria. One of them could be the year that the information was last changed. ClinVar has only been around since 2012, so no variants are older than that, but I thought it could be changed so that you can show only variants from the last two years. Another filter criteria could be pathogenicity. ClinVar and LOVD use the same pathogenicity scales (with slightly different wording). The degrees of pathogenicity are benign, likely benign, variant of unknown significance, likely pathogenic, and pathogenic. The users could also filter the ClinVar variants based on the review status (star level) from clinvar. These are as follows: 0 stars - No submission information provided, 1 star - Single submitter or multiple submitters with conflicting interpretations, 2 stars - multiple submitters with no conflicts, 3 stars - determined by expert panel, 4 stars - clinical standard for diagnosis. Finally, it would be nice if the viewer could filter based on the database. They could select only variants present in both ClinVar and LOVD, variants in only ClinVar, variants only in LOVD, or variants only from a specific LOVD database. Ignore the poorly erased line in the figure below (crappy eraser).


![dash.png](attachment:dash.png)

Another graph that could appear on the page after selecting the disease is a line chart showing the proportion of variants for a given gene that are of each pathogenicity.


We would like to make a second page that shows visualizations for one gene at a time. 

![image8.png](attachment:image8.png)

Due to being drawn in crayon, the picture shows labels next to the lines. Ideally, the name would appear on hovering over a line. MLD has only three genes associated, so three separate colors can be used. However, with a disease like SCID, the display of 39 genes would simply be too much. Instead, the color could be based on the number of variants for the gene with a scale on the side. All lines would be at 50% opacity (maybe less) to allow for viewing all lines at the same time. 

A second page could be made with information pertaining to a specific gene. Alternatively, this info could be shown at the bottom of the first page. A link from the original page can take the viewer to the second page. On the second page a drop down menu can be used to pick a single gene of interest. 

On the second page a chart can show variants’ location within a gene. The representation of the gene will follow that of the University of California Santa Cruz (UCSC) Genome Browser. The thin lines represent intronic regions and intergenic regions. The thickest regions represent exons. The regions of medium thickness represent untranslated regions of exons. The variants from ClinVar will be represented on the top of the gene representation and the variants from LOVD databases will be represented on the bottom of the gene representation. Each variant is represented by a line. The height of the line represents the frequency of the variant in the global population on a negative log base 10 scale. The color of the line represents the reported pathogenicity.

![image9.png](attachment:image9.png)

Potentially add a brush to make it so that you can zoom in.  

![image10.png](attachment:image10.png)

This graph could also be redrawn with the color representing the variant type (e.g. red is single nucleotide variant, green could represent duplication, etc.). Instead of using frequency of the variant, the height could represent the number of times a variant was reported or the number of stars the variant is given in ClinVar. 

Another chart could be a radar chart that shows the number of variants of each type per database. Color would represent the type of variant, each position represents a single database and distance from center represents the number of variants of that type. 

![image11.png](attachment:image11.png)

Another chart for this page could be a scatter plot. The X-axis could represent location within the gene, the Y-axis could represent the -log10 frequency of the variant. The color could represent pathogenicity (colors are same as the previous coloring), and size of the point could represent the number of times the variant was reported. 

![image12.png](attachment:image12.png)

Another graph could be a scatter plot to show the comparison of reported pathogenicity of the variants. Across the x-axis could be the reported pathogenicity in ClinVar and across the y-axis could be the reported pathogenicity in LOVD. The size of the circle could represent the number of variants that fall within that category. 

![image13.png](attachment:image13.png)

Or add a bar chart, maybe add the number into the middle of the circle

A final graph for the individual gene page could be a stacked bar chart showing the number of variants that failed HGVS validation per each database. The X-axis could be the database. The Y-axis could be the number of variants that failed for each category. The colors could represent the reasons that the variants failed validation. This is important to point out that a large portion of variants from ClinVar fail validation, while almost nothing from the LOVD databases fails validation. 

![image14.png](attachment:image14.png)

This chart could have a button to click to switch it from number of variants that failed to percentage of variants in the database that failed for each given reason. NM_0001.01:c.123insA -> NM_0001.01:c.126dup ACTGAAAAG -> ACTGAAAAAG <br />
Microsatellite: NM_0001.01:c.123A[4]<br />
Compound: NM_0001.01:c.(?-123)_(456,789-?)del<br />

### Must-Have Features

The web page must have the drop-down button to allow the user to select a disease. The web page must be able to display the bar charts showing the percentage of overlap between ClinVar and LOVD databases. It must display per disease, and must be able to display per gene when a disease is selected. The stacked bar charts showing the number of variants of each type is also necessary. 

For the individual gene page, the scatter plot showing the comparison of pathogenicity between ClinVar and LOVD is necessary. 

The individual gene page should also show the stacked bar chart representing the number of variants of each type.

The stacked bar chart showing the number of variants that failed HGVS validation should also be included. 

### Optional Features

The ability to go to a second page to view information about an individual gene is nice, but not absolutely necessary. The option to switch to count of variants instead of percent of variants is nice but not necessary. It would also be nice to have the multiple line chart showing the number of variants of each pathogenicity per gene, but this is not necessary. 

The ability to filter by year, pathogenicity, database, or number of stars from ClinVar is also ideal, but not absolutely necessary.

The line graph showing the location of variants within the gene and their frequency would be really nice, but not absolutely necessary. 

The radar chart would be fun and add a figure that was not made using only rectangles and lines, but is also not necessary. 

The scatter plot showing the distance from TSS on the x-axis and the log10 frequency on the y-axis with color representing pathogenicity would also add another figure that is not just bar charts, but is also not absolutely necessary. 

### Schedule

The bash script to obtain the frequency information and the SQLite database should be built by November 13. Dave will be in charge of obtaining frequency information and setting up the SQLite database.

The HTML page should be built with spaces designated for each design by November 13. Marcus will set up the HTML page outlines.

The absolutely necessary features should be added by November 20th. If anything is not completed, these features should be top priority to be added by November 27th. Dallon, Dave and Marcus will select which features they think are in their individual skill sets and decide who will make which feature.

The optional features should be added by November 27th if there are no problems with the absolutely necessary features. Dallon and Dave will work on the remaining features.

##### References

1. National Institutes of Health (US); Biological Sciences Curriculum Study. Understanding Human Genetic Variation in NIH Curriculum Supplement Series, 2007
2. Olson MV. (2012) Human Genetic Individuality. Annu Rev Genomics Hum Genet. 13(1):1–27. PMID:22657391.
3. Jackson M, Marks L, May GHW, Wilson JB. (2018) The Genetic Basis of Disease. Essays Biochem. 62(5): 643–723 PMID: 30509934
4. Burke W, Zimmern RL, Kroese M. (2007) Defining purpose: a key step in genetic test evaluation. Genetics in Medicine 9: 675-681
5. Richards S et al. (2015) Standards and guidelines for the interpretation of sequence variants: a joint consensus recommendation of the American College of Medical Genetics and the Association for Molecular Pathology. Genetic Med. 17(5): 405-424
6. Landrum MJ, Lee JM, Riley GR, Jang W, Rubinstein WS, Church DM, Maglott DR. (2014) ClinVar: Public Archive of Relationships among Sequence Variation and Human Phenotype. Nucleic Acids Res. 42(DI): D980-D985 PMID: 24234437
7. Fokkema IF, Taschner PE, Schaafsma GC, Larso JF, den Dunnen JT. (2011) LOVD V.2.0: the next Generation in Gene Variant Databases. Hum Mutat. 32(5): 557–563 PMID: 21520333
8. Burn J and Watson M. (2016) The Human Variome Project. Hum Mutat. 37(6):505-507
9. Den Dunnen JT and Antonarakis SE. (2000)  Mutation nomenclature extensions and suggestions to describe complex mutations: a discussion. Hum Mutat. 15(1):7-12. PMID: 10612815
10. Karczewski KJ, Francioli LC, Tiao G, Cummings BB, Alfoldi J et al. (2019) Variation across 141,456 human exomes and genomes reveals the spectrum of loss-of-function intolerance across human protein-coding genes. bioRxiv doi:https://doi.org.10.1101/531210. 
11. Hart RK, Rico R, Hare E, Garcia J, Westbrook J, Fusaro VA. (2015) A python package for parsing, validating, mapping and formatting sequence variants using HGVS nomenclature. 



```python

```
