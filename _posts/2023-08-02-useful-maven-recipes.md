---
title: "Useful maven recipes"
date: 2023-08-02 22:05:00 -0400
blogger_url: "https://mfjassociates.blogspot.com/2023/08/useful-maven-recipes.html"
---

##  Filtering java sources using maven properties

As you probably know, the maven resource plugin gives you the ability to create resources directory where the resource files will be filtered so that any maven properties defined in the build can be interpolated or substituted.  This allows you for example to create a properties file like:

  

artifactid=${project.artifactId}

  

when packaging this properties file the property artifactid will be set to the value of the maven project's artifactId.

  

When using annotations, the strings used in the parameters must be know at compile time and if you want to use a maven property such as project.version, you cannot use the previous property file since the string will only be created at runtime.  This is where java filtered source files comes into play.

  

What you need to do is in the parent POM shared by your application, add the following plugin executions:

      <plugin> 
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-resources-plugin</artifactId>
        <executions>
          <execution>
            <id>generate-filtered-sources</id>
            <phase>generate-sources</phase>
            <goals>
              <goal>resources</goal>
            </goals>
            <configuration>
              <outputDirectory>${project.build.directory}/generated-sources/filtered</outputDirectory>
              <resources>
                <resource>
                  <directory>src/main/java-filtered</directory>
                  <filtering>true</filtering>
                </resource>
              </resources>
            </configuration>
          </execution>
        </executions>
      </plugin>  

  

  

Then in any maven java modules where you want to defined constants that will be known at compile time, you simply create this folder:

  

src/main/java-filtered

  

Inside this folder you create the folder structure com/greatcompany/greatapp and create the following Constants.java file:

  

package com.greatcompany.greatapp; 

public interface Constants {

      public static final String ARTIFACT\_ID="${project.artifactId}";
      public static final String GROUP\_ID="${project.groupId}";
      public static final String VERSION="${project.version}";
      public static final String PACKAGING="${project.packaging}";
      public static final String FINAL\_NAME="${project.build.finalName}";

}

  

In any java class in your application where you need the compile time constants just say that  the class implements com.greatcompany.greatapp.Constants .

  

The last point I would like to make is that if you do not have the folder java-filtered then no errors will occur and that fact will be silently ignored.  This means that all you need to do to use the filtering capabilities is to create the filtered folder and put some source files.

  

Voila!
