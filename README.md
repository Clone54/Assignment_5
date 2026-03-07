What is the difference between var, let, and const?
Ans->
    (i) A variable declared with "var" can be redeclared.
    (ii) A variable declared with "let" cannot be redeclared. It has block scope.
    (iii) A variable declared with "const" cannot be redeclared or reassigned. It has block scope.

2.What is the spread operator (...)?
Ans->
    The spread operator seperates the elements of an array or object and make indivisual elements.

3.What is the difference between map(), filter(), and forEach()?
Ans->
    (i) map(): It transforms every item to an array of same length.
    (ii) filter(): It returns an array with the elements that are passed in a test case.
    (iii) forEach(): It is like a loop, like runs a funtion for every items.

4.What is an arrow function?
Ans->
    Shorter way to write a function.
    Example:
        Normal way:
        function(x,y){
            return x+y;
        }
        Arrow way:
        (x,y) => x+y;

5.What are template literals?
Ans->
    When a string wrapped in a backticks instead of the quotation marks. ${variable}