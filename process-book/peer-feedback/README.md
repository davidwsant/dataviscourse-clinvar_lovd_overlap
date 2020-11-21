# CS 5630 / 6630 Project Peer Feedback

## We were reviewed by Kaelin Hoang and Sunny Siu

Kaelin and Sunny said that the idea behind our project was really good and that it was
an interesting story to tell. They asked if this data could be useful for clinicians
to view. They were impressed that we had programs to gather data from so many different 
sources and that we were going to do this for so many genes. This is an awful lot of data.

Specific points that we went over:

# General Questions
* Are the objectives interesting to the target audience? 
  * Yes, the objectives will be helpful for portraying information to people working with genetic information including clinicians
* Is the scope of the project appropriate? If not, suggest improvements. Is the split between optional and must-have features appropriate? Why?
  * Yes, the scope is met, but there is a concern that this may be too much. This is a complicated topic and it may take a lot of explaining for members of this class to understand what we are doing. Additionally, this is TONS of data to be working with considering it is such a short time to get the program together. We aren't even started with coding the website, only with gathering the informatoin. There are not very many must have features, but they are all complicated because of the amount of data being portrayed. 
* Is the visualization innovative? Creative? Why?
  * Yes, they thought this was a very creative way to show information about genetic variants. It is in such a format that it is easy to understand, even for individuals that have very little understanding of genetics. They especially liked the gene diagram. 
* Does the visualization scale to the used dataset? Could it handle larger but similar datasets? 
  * They did not comment on this, but all of the figures can scale for all possibilities in the data we are using. We do not plan to add new diseases, but if new diseases were added they certainly would not have so many genes that it would make our visualizations no longer useful. However, if we do plan to move on to a very large gene list (such as the genes related to deafness), this would need significant adaption. 
* Is the project plan detailed enough? Is a path to the final project clear?
  * Yes, the plan is very detailed, and the path to the final project is clear. 
* Is an interesting story told? 
  * Yes, the story is interesting because it can be used to help people determine if variants are pathogenic or not. 

# Visual Encoding
* Does the visualization follow the principles used in class? 
  * Yes, the basic principles for design of visualization and usability and interpretability are followed. 
* What is the primary visual encoding? Does it match the most important aspect of the data? 
  * They specifically mentioned that they like how we have several different types of encodings. They said that they thought it was creative to have so many different ways of showing the information. They really liked that it starts off with a broad picture, then you can zoom in to look at genes within a specific disease, then you look at info about a single gene.
* What other visual variables are used? Are they effective? 
  * They noticed the different views we had designed and said they looked like they would effectively allow the user to investigate multiple aspects of the data.
* Is color sensibly used? If not, suggest improvements. 
  * Yes. Color scheme used was copied from python, which uses a color-blindness sensitive scheme. Any changes in color will still take into account colorblindness and make sure the colors are easily distinguishable.

# Interaction and Animation
* Is the interaction meaningful? If not, suggest improvements.
  * Yes, they mentioned how they liked that each visualization allows us to drill down into each level of the data. They also thought adding a brush function would be helpful on the gene diagram. They liked the multiple layers of filters. 
* If multiple views, are they coordinated? If not, would it be meaningful?
  * We do not have multiple views, unless you consider the zoomed view on a gene. Multiple views wouldn’t be particularly meaningful in this case because each visualization is planned to be independent of all other visualizations. 
* Is there any animation planned? Is it clear? Is it intuitive?
  * We do not have any animation planned at the moment. We will incorporate transitions into the visualization when selecting different views.