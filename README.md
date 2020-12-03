
# **Data Visualization CS - 5630/ CS - 6630 Final Project**
## Investigating Overlap and Segregation of Variants between ClinVar and LOVD Databases

### Basic Info

|   	| Member 1| Member 2| Member 3|
|---	|---	|---	|---	|
|Name|David Sant|Dallon Durfey|Marcus Stucki|
|Email|david.sant@utah.edu|dallon.durfey@utah.edu|marcus.stucki@hsc.utah.edu|
|UID|u0454956|u01275125|u0420655|

Our project webpage is hosted on [GitPages](https://davidwsant.github.io/dataviscourse-clinvar_lovd_overlap/).
The video to accompany this project can be found on [YouTube](https://youtu.be/ChWy0Gjzrso).

### Background and Motivation

Any two unrelated individuals will have approximately 0.1% difference in their genetic code.<sup>1,2</sup> Most of these differences are inherited while a small number arise every generation, known as de novo mutations. These differences are important as they (along with our experiences in life) contribute to our individuality. Simply put, they help make us who we are.

Unfortunately, some genetic variations can lead to changes in gene expression or alterations in the function of a gene, which can lead to phenotypic changes, including disease.<sup>3</sup> Many clinical studies and research studies focus on determining the genetic variation behind a disease. Finding the genetic cause of a disease can help inform a diagnosis, confirm a diagnosis, identify reproductive risks, guide treatment and contribute to further knowledge about a disease.<sup>4</sup>  

Once genetic testing is performed, determining the pathogenicity of specific variants can be quite difficult considering that very few variants have been established by expert committees to directly cause disease. Furthermore, whole genome sequencing (WGS) and whole exome sequencing (WES) typically return several thousand variants that are rare in the general population. Even targeted panels may return dozens of variants that are predicted to alter protein function in relevant genes.

The American College of Medical Genetics (ACMG) and the Association for Molecular Pathology (AMP) have established a set of criteria for determining if variants are pathogenic or benign. One of those criteria is to determine if the variant has been reported as associated with a disease in a reputable clinical genetic database.<sup>5</sup> The National Center for Biotechnology Information hosts a database called ClinVar which contains information about hundreds of thousands of genetic variants. Submitters come from many countries and this is the predominant clinical genetic database used by many diagnostic groups around the world, including most clinical genetics groups in the United States.<sup>6</sup> Another set of databases with a similar goal has been established in Europe, collectively known as the Leiden Open Variant Database (LOVD).<sup>5</sup> Rather than allowing anyone to submit variant information to a single database, the LOVD group has chosen to instead allow users to create their own database built upon the LOVD platform, so several dozen LOVD databases are currently in use. The predominant LOVD databases are currently maintained by the members of the Human Variome Project.<sup>8</sup>


While clinical genetic information is contained in both ClinVar and the LOVD databases, many clinical groups in the United States tend to only look to see if variants have been reported in ClinVar. This is likely because ClinVar is far more well known in the United States and all of the information is obtained from a single database. LOVD, on the other hand, is not as well known and requires searching several databases and therefore requires significantly more time. Additionally, not all LOVD databases contain information about variant pathogenicity. Furthermore, many clinical geneticists and genetic counselors are not aware that many variants in LOVD are not contained in ClinVar.


Over the summer David Sant worked with the Utah Department of Health (UDOH) to create a series of python scripts to obtain variant information for variants in specific genes from both ClinVar and LOVD databases. The genes chosen were all related to diseases on the UDOH newborn screening (NBS) panel. The project involved only obtaining information about the variants (including reported pathogenicity) and normalizing the variant annotations to Human Genome Variation Society (HGVS) format. The project involved no visualization aside from several bar charts generated using python. The visualizations that will be used for this project are all new. The code for obtaining the variants can be found on the [Eilbeck lab GitHub page](https://github.com/eilbecklab/Utah-DOH-newborn-screening).


### Project Objectives

The primary objective of this project is to visualize the overlap and segregation of variants between ClinVar and LOVD. When working with the genetic counselors last summer, it was found that LOVD was generally thought to contain essentially no variants that were unique from ClinVar. Out of the 55 genes investigated for the NBS panels, only 17% of the total variants were found both in ClinVar and at least one LOVD database. We would like this project to show that there is minimal overlap and that some genes have more variant information in LOVD websites than ClinVar.


We would like to add some information to the visualization. The frequency of a variant within the population is an important factor to consider when determining if a variant is pathogenic. This information has not been added, but we hope to add a script to include gnomAD frequency information to the variants.<sup>10</sup> This will help us visualize where in the genes the variants are rare or common.

We would also like to visualize the regions of genes where variants are reported. It is well known that certain domains within proteins may cause damages when mutated while others are very resilient. We would like to visualize the location of variants within the genes. This visualization, along with the visualization of the frequency of variants, will help us visually see which regions of the gene are more likely to harbor pathogenic mutations.

Additionally, we would like to visualize information about the variants that could not be normalized to HGVS using the biocommons software.<sup>11</sup> ClinVar is famous for containing large numbers of variants, but a surprisingly large number of variants within ClinVar have no genetic information or information that cannot be normalized. We would like to show the discrepancy between ClinVar and LOVD with regard to the variants that cannot be normalized automatically.

Further details about the project proposal can be found in the [Project Proposal](project-proposal) directory. The GitHub repository containing the code for obtaining the variant information can be found on the [Eilbeck Lab GitHub page](https://github.com/eilbecklab/Utah-DOH-newborn-screening).


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
