---
title: "Agile Programming, Continuation"
date: 2007-05-12 08:21:00 -0400
tags: ["multiple-selection list rails agile programming"]
blogger_url: "https://mfjassociates.blogspot.com/2007/05/agile-programming-continuation.html"
---

OK, I said I would continue some other time and if history was any indication, it would have been a long time. But I had the burning urge to say something and my ardent followers were just holding their breath to read it (:-)).  
  
I talked about conventions and ignorance. Here is a case in point (and actually this is a really good example of how to do a multiple selection list in Ruby On Rails).  
  
Here is how to get started. In a windows command prompt window you type:  
  

cd c:\\workspaces  
rails msexample  
cd msexample  
ruby script\\generate model Movie title:string producer:string  
ruby script\\generate model Category label:string  
ruby script\\generate migration CreateCategoriesMovies  

  
Then you edit db\\migrate\\003\_create\_categories\_movies.rb as follows:  

  
class CreateCategoriesMovies < ActiveRecord::Migration  
 def self.up  
   create\_table :categories\_movies, :id => false do |t|  
     t.column :category\_id, :integer  
     t.column :movie\_id, :integer  
   end  
   add\_index :categories\_movies, \[:category\_id, :movie\_id\], :unique => true  
 end  
  
 def self.down  
   drop\_table :categories\_movies  
 end  
end  

  
This will add the has\_and\_belongs\_to\_many (habtm) relationship which is describe [here](http://api.rubyonrails.org/classes/ActiveRecord/Associations/ClassMethods.html#M000645). You need to edit the two models also. Here is app\\models\\category.rb:  

  
class Category < ActiveRecord::Base  
 has\_and\_belongs\_to\_many :movies  
end  

  
Here is app\\models\\movie.rb:  

  
class Movie < ActiveRecord::Base  
 has\_and\_belongs\_to\_many :categories  
end  

  
We then create the MySQL database using the following commands:  

  
mysqladmin -u root create msexample\_development  
rake db:migrate  

  
We will then create a set of standard views to be able to edit our list of movies.

  
ruby script\\generate scaffold Movie  

  
We will further customize the form created for this purpose by the scaffold generator by simply adding 2 lines. Here is the app\\views\\movies\\\_form.rhtml:  

  
<%= error\_messages\_for 'movie' %>  
  
<!--\[form:movie\]-->  
<p><label for="movie\_title">Title</label><br/>  
<%= text\_field 'movie', 'title'  %></p>  
  
<p><label for="movie\_producer">Producer</label><br/>  
<%= text\_field 'movie', 'producer'  %></p>  
  
<p><label for="movie\_categories">Categories</label><br/>  
<%= select('movie', 'category\_ids', Category.find(:all).collect {|p| \[ p.label, p.id \] }, { :include\_blank => true}, {:multiple => true, :size => 3})  %></p>  
<!--\[eoform:movie\]-->  

  
The last thing we need to do is to create the categories scaffold (the rails thing that will allow us to edit categories).  

  
ruby script\\generate controller Categories  

  
We then edit app\\controllers\\categories\_controller.rb:  

  
class CategoriesController < ApplicationController  
 scaffold :category  
end  

  
We are now ready to start the server and navigate to http://localhost:3000/categories to edit and add a few categories and then http://localhost:3000/movies to edit our movies and assign categories to them.  

  
ruby script\\server  

  
In my next post I will describe the huge number of conventions that went into making this possible. And it is worthy to note that this only required 60 lines of code (as the rake stats command show below will tell you) of which 49 were created by the rails generation software:  

  
C:\\Documents and Settings\\mario\\workspaces\\radrails2\\msexample>rake stats  
(in C:/Documents and Settings/mario/workspaces/radrails2/msexample)  
+----------------------+-------+-------+---------+---------+-----+-------+  
| Name                 | Lines |   LOC | Classes | Methods | M/C | LOC/M |  
+----------------------+-------+-------+---------+---------+-----+-------+  
| Controllers          |    61 |    48 |       3 |       8 |   2 |     4 |  
| Helpers              |     7 |     6 |       0 |       0 |   0 |     0 |  
| Models               |     6 |     6 |       2 |       0 |   0 |     0 |  
| Libraries            |     0 |     0 |       0 |       0 |   0 |     0 |  
| Components           |     0 |     0 |       0 |       0 |   0 |     0 |  
| Integration tests    |     0 |     0 |       0 |       0 |   0 |     0 |  
| Functional tests     |   110 |    79 |       4 |      13 |   3 |     4 |  
| Unit tests           |    20 |    14 |       2 |       2 |   1 |     5 |  
+----------------------+-------+-------+---------+---------+-----+-------+  
| Total                |   204 |   153 |      11 |      23 |   2 |     4 |  
+----------------------+-------+-------+---------+---------+-----+-------+  
  Code LOC: 60     Test LOC: 93     Code to Test Ratio: 1:1.6
