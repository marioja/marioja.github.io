---
title: "Performance Visualization - What the heck?"
date: 2007-02-15 18:18:00 -0500
tags: ["visualization"]
blogger_url: "https://mfjassociates.blogspot.com/2007/02/performance-visualization-what-heck.html"
---

Yeah, exactly what I asked the first time I started thinking about it. But then I met my buddy [Neil](http://www.perfdynamics.com/) at CMG (Computer Measurement Group) in Reno (brrr, was it cold there) and we started talking about hot topics and performance visualization came up. Actually, I don't recall if this happened before or after we had a few beers. This is not that important because most really good ideas came after a few beers.  
  
So, back to the topic at hand. Visualization is not a new concept. It has been used in several fields. Here is a list of web site with various applications of visualization:  
  

-   [digg labs](http://labs.digg.com/swarm/)
-   [Parallel coordinates](http://catt.bus.okstate.edu/jones98/parallel.html)
-   [Treemaps for space-constrained visualization of hierarchies](http://www.cs.umd.edu/hcil/treemap-history/)
-   [Edward Tufte](http://en.wikipedia.org/wiki/Edward_Tufte)
-   [sparklines](http://www.edwardtufte.com/bboard/q-and-a-fetch-msg?msg_id=0001OR&topic_id=1)
-   [John Tukey](http://en.wikipedia.org/wiki/Tukey)
-   [Gallery of Data Visualization](http://www.math.yorku.ca/SCS/Gallery/noframes.html)
-   [Earth Simulator Center](http://www.es.jamstec.go.jp/esc/eng/)

  
Here is a technical article on visualization as it applies to computer and network performance.  
  

-   [Performance Visualization May 2005 Article by Neil](http://www.cmg.org/measureit/issues/mit22/m_22_1.html)

  
Now the big complaint from my good friend Neil is that people in the performance field are content with the usual visualization techniques such as boring bar charts, plots and pie charts simply because they are not aware that other "better" (I will come back later with what better means) visualization techniques are possible. Performance tool vendors are not interested in funding R&D for new performance visualization techniques for the same reason and also quite simply because no one is asking for it.  
  
The purpose of this entry is to talk about the problem with the intent of gathering interest in this very interesting problem which is truly not a simple one to solve.  
  
The problem with visualization is that one needs to come up with a way to represent a digital abstraction (performance data) in a way which is natural or easy for the human computer (the brain) to interpret. Now, put this simply this sounds like a rather simple proposition. However, it is actually extremely difficult to solve. In this discussion, if a given visualization technique is easy for the human brain to interpret it is said to have a good impedance match. The reverse condition is said to have a poor impedance match.  
  
The reason this problem is not an easy one to solve is because the scientific rules for defining what is a good impedance match have not been well defined or studied. Several techniques have been tagged as having a good impedance match but rather on subjective terms using words like "cool", "neat" and even the odd "wow". This does little though for providing a methodology for coming up with visualization techniques of performance data that have a scientifically derived good impedance match.  
  
The other problem with visualization in general is that quite often a good visualization is one within a three dimensional universe. This is probably the case because the human brain is accustomed to operate in such an environment. However, representing a 3D visualization in a 2D computer screen is a difficult, costly and challenging approach. This problem has become much more accessible to the masses with the advent of super computers like dual-core CPUs, hyper threading cores, etc and the great advancements in video card technology in the last 5 years.  
  
The problem domain where visualization has gather momentum is in the field of marketing. This is because a great deal of visualization customization (as opposed to generalization for performance data) is possible from a cost point of view because of the nature of the problem. 1 particular visualization is applicable to 1 and only 1 product or service.  
  
In my next entry, I will try to expand on examples in some or all of the fields discussed so far. As always, your comments are welcomed.
