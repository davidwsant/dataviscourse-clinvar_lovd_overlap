# Mentor Feedback 

## Our progress was reviewed by Devin Lange on November 20, 2020

During the meeting we went through the current status of the website and all figures. We 
had proposed several figures, but drafts of only three of them were made. Probably the 
greatest thing about the website is that all filters were effective for all figures made.
All figures include the ability to filter genes by database (7 options), variant type (5 
options), reported pathogenicity (7 options) and review status (3 options). 

### Overlap Graphs 
The first figure was the graph to show the overlap of variants between ClinVar and LOVD. 
The graph correctly filtered based on the selected input from the user. The graphs looked 
good, but did not have any labels. The labels needed to be added. Additionally, the colors
were perhaps not ideal. The colors were chosed because they matched what python uses as 
default colors becuase they are well suited for people with colorblindness. However, using 
green, orange and blue does not really represent overlap well. Devin recommended changing 
the colors for something that would represent mixing, such as blue for ClinVar, red for 
LOVD and purple for the overlap between the two. Another option that would look nice if we
could use both colors for the middle but have them in a striped pattern like a candy cane
to represent that they are present in both. 

Another thing Devin mentioned we should do was have interactivity. It already filters based 
upon several user specified criteria, but there are two graphs that show the same information 
in different ways and they should be linked. One shows the overlap and exclusivity by 
percentage, the other shows the same information by percentage. If you could click one section 
of a bar in one graph, we would like it to highlight the related section in the other bar 
graph. 

### Line Graphs
We have one figure that shows line charts indicating the proportion of variants of each given 
pathogenicity. Devin pointed out that linking them makes sense as they are in the order from 
lowest pathogenicity to highest pathogenicity, but the two at the end ('conflicting' and 'not
reported') are not actually on that scale. Devin recommended we add circles at each point along 
the line, and then make the line stop when it got to the last two. That way it would not look 
like they were 'extra pathogenic' and 'super pathogenic'. 

Devin also pointed out that these ones need to be more interactive. For instance, if they were
lower opacity and then became dark on hover, that would be nice. If you clicked on a circle, a 
tooltip could show you what the number and percentage of variants for that gene for that 
pathogenicity are. 

Again, labels were not present. They should be added. 

### Scatterplot
The scatterplot looked really good. Once again, labels need to be added. This apparently was 
not a concept on any of our minds until we finished making the graphs. This figure was not 
yet finished, so the dots were all red. The colors need to be updated to represent the 
pathogenicity as we had said we would. 

It would be nice if you could hover over any given point and have a tool tip that would show 
the variant information. 

The scatter plot shows some great information and would really be ideal for a storytelling 
piece. No storytelling has been added yet, so using a preset filter could show something 
really cool here. 

