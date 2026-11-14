---
title: "How to invoke the Adobe Bridge CC - Photo Downloader on any arbitrary folder"
date: 2014-05-10 20:32:00 -0400
blogger_url: "https://mfjassociates.blogspot.com/2014/05/how-to-invoke-adobe-bridge-cc-photo.html"
---

As you have seen in my post [Digital photography workflow](http://mfjassociates.blogspot.com/2009/04/jauvin-digital-photography-workflow.html) I use the photo downloader from Adobe bridge as the corner stone of my workflow.  Sometimes, I am in a rush and I need to take a copy of what is in the memory card and keep it somewhere for safekeeping until I have time to process it.  What I have to do then is once I am ready, copy the folder content that was stored for safekeeping into a new cleaned up memory card and start bridge to download the images.  
  
Here is a technique so that you do not need this copy back (which can be slow if you are copying 32 GB of images back onto a memory card).  
  
Let assume that you have copied the memory card content to a folder say  
  
h:\\backup\\memory card from houston trip  
  
what you need to do is to look into Windows Explorer for a drive letter not in use in your computer at the moment.  Lets say this is drive P:.  You type the following command at a command prompt:  
  
subst p: "h:\\backup\\memory card from houston trip"  
  
This will create a drive P: with the content of the original memory card.  Then you type the following long command line (for Adobe Bridge CC, not sure if older version work the same) where P: represent your newly created drive with the subst command above:  
  
"C:\\Program Files\\Adobe\\Adobe Bridge CC (64 Bit)\\photodownloader\\Photodownloader.exe" module=photodownloader params mode=direct devType=volume priDevId="P:"  
  
And voila! You should then see the familiar Adobe Bridge CC - Photo Downloader window.  That's all folks.
