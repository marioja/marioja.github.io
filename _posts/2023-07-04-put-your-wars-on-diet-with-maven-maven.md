---
title: "Put your WARs on a diet with Maven: Maven and skinny wars!"
date: 2023-07-04 21:36:00 -0400
tags: ["java","maven","skinny wars"]
blogger_url: "https://mfjassociates.blogspot.com/2023/07/put-your-wars-on-diet-with-maven-maven.html"
---

I have seen a lot of confusion and misunderstanding on what is and why use a java enterprise concept called skinny war. In simple terms, a skinny war is a WAR where some of its dependencies are moved from the WAR module WEB-INF/lib to the EAR lib folder. 

This post is specifically written to deal with skinny wars and does not explain or go into details which jars must be in the WAR class loader and which one do not have to. It is assumed that the reader is familiar with this concept and the concept of the WAR class loader versus the application class loader. Suffice it to say that typically, JAR that must be scanned by CDI usually belongs in the WAR class loader. Web fragments and jars with tag libraries are other candidates. Also, all test and provided scope artifacts must be specified in the WAR module as having maven remove them from the WAR does not make sense as they were never to be put there and having them in a deps POM file does not work. They will not be event at compile time or test time in the class path for the WAR module. The last short comment I will make is that the reader is reminded that a class from the EAR class loader is unable to access a class from the WAR class loader due to the JEE spec. The corollary that is pertinent to this discussion is that any class that depend on another class only found in the WAR class loader must also be found in the WAR class loader. These principles should guide you in your selection of jars when constructing your skinny wars. 

Let me first start by saying that there is no such thing as a skinny war on its own. A WAR module must be constructed with all its gear (read jars) in the WEB-INF/lib if the WAR is going to be deployed on its own. The concept of skinny war only comes to play when you build an EAR file that contains one or more WAR modules. This is why when you have a multi-module maven project that builds an EAR file, the WAR artifact that is built in the WAR project will not be affected by skinny war processing and the WAR artifact that is built and packaged inside the EAR will be affected by skinny war processing. Do not go looking for your skinny war in your WAR module but rather open the EAR file and look at the WAR module inside. 

## What are the benefits 

If you have only 1 module (a WAR in that case), then there is little to no benefit. It is when you have multiple modules that the benefit comes into play. If you have other modules that require the same set of dependencies as your WAR module you will be able to save a lot of space by only including 1 copy in the EAR lib folder. 

How do you create a skinny war 

There are three scenarios with varying degrees of complexity in achieving them. To create a skinny war, maven requires you to do two simple things: 

1.  Turn on the <skinnyWars>true</skinnyWars> in the EAR plugin configuration. 
    

1.  Add to the EAR POM every WAR dependency that you want removed from the WAR module 
    

These rules imply that you need to specify every dependency omitted from the WAR module in two places (argh, duplication I hate it but more on this later). First you must add it to the WAR module so that it will compile and use it. Second you must specify it in the EAR module also so that maven will know you want it removed from the WAR. Please note that the rules apply whether the dependency is specified or is transitive (i.e., added because it is a dependency of another dependency that was specified). 

Let us start with the simple case. 

## Skeleton skinny wars or no dependencies in WAR WEB-INF/lib 

This is by far the simplest and easiest scenario to implement. This is the scenario where you want all WAR dependencies moved to the EAR file. Hold on a second, you say this is easy? How can that be? Let us say you have 20-30 dependencies, you meant that duplicating them both in the WAR and the EAR module is easy (I know, I know, there is cut and paste)? What about maintaining this mess through time? 

Here comes a neat trick (hey I did not invent it, see [https://blog.frankel.ch/dry-and-skinny-war/](https://blog.frankel.ch/dry-and-skinny-war/) and [https://blog.frankel.ch/skinny-war-done-right/](https://blog.frankel.ch/skinny-war-done-right/)). In your EAR POM, instead of re-adding every dependency from the WAR file, simply add to the EAR a dependency to the WAR POM file (same syntax as WAR dependency except that you change the type to POM and scope to import. I have always done it without import scope and it seems to have worked also. The great benefit of using this technique is that if you decide to add or remove a dependency in your WAR module, you do not have to repeat the same change in your EAR module. 

## Pretty skinny wars or some dependencies in the WAR WEB-INF/lib 

This is getting a little more complicated. What if you want some of your jars to remain in the WAR WEB-INF/lib folder and other in the EAR lib folder. If you have, say, 10 dependencies in your WAR, then you would have to enter them all in the WAR and repeat the ones you do not want in the EAR and keep both lists in sync as you continue developing this application.

Seems like a lot but fortunately, it is possible to use the DRY (don’t repeat yourself) principle again by creating a new POM module (call it deps for short) in your multi-module maven project and **specify** **all** **the dependencies you do not want kept in the WAR module** in this new deps module. Then in your WAR POM file, specify all dependencies you want kept in the WAR along with test or provided scope dependencies. Then add the deps POM module to your WAR. This should give your WAR modules all the dependencies they require. 

Then in the EAR module, replace the WAR POM file with the deps POM file. This should add only those to the EAR lib folder and remove them from the WAR module. Voila! 

## Almost skinny wars or some transitive dependencies in the WAR WEB-INF/lib  

Here is the last but not the simplest use case to handle. Let's say that OtherModule requires spring-security-taglibs to be in the WAR module (as per the Java EE tutorial, all tag libraries definition must be in the WAR class loader). Furthermore, let’s assume that OtherModule will also be calling stuff from spring-web or spring-security-web. It is then necessary to ensure that spring-security-taglibs, spring-security-web, spring-web and OtherModule to be in the WAR class loader. 

There is a simple but not so efficient way to do this: 

-   Add OtherModule to the deps module
-   Add the deps module and log4j-core to the WAR POM 

Why is this not efficient? Because most of the dependencies in this EAR file are transitive dependencies of spring-security-taglibs (16 to be exact for version 6.0.3). Since it does not appear in the EAR lib then spring-security-taglibs and all its 16 dependencies will be left in the WAR. This would leave 17 jars (including the OtherModule.jar) in the WAR and 2 log4j jars in the EAR lib folder. WAR is not very skinny. We can do better. Here is a secret: in order to do skinny wars correctly (with Maven or not) you need to understand your code and the dependencies that you use. This means that someone without that knowledge will have a lot of ClassNotFoundException or NoClassDefFoundError or might create fatter wars than required. 

So how can we improve on the 17/2 WAR/EAR ratio? 

When I look at spring-security-taglibs’ transitive dependencies, I see that spring-jdbc and spring-tx do not appear. I can infer that those two jars are most likely not required in the WAR module and hence I can leave them as a transitive dependency for spring-security-acl in my deps file (while excluding all the other ones). This will move them to the EAR module only since they appear in both. 

This will leave 3 more jars out of my WAR module. With the current knowledge of the application and the amount of effort expended, this is probably the best that can be done. There is one more jar that could possibly be moved out of the WAR (by leaving out of spring-security-act’s exclusion in the deps module) and it is spring-core. If we did that, spring-core and spring-jcl would move out of the WAR file. As said before, you must know your application well and test it thoroughly. 

## Sample code 

You can get a sample multi-module maven spring project by checking out the SKINNY-EXAMPLE branch from the following GitHub project: 

[https://github.com/marioja/sample-tests.git](https://github.com/marioja/sample-tests.git) 

Feel free to make comments, suggestions or pull requests.
