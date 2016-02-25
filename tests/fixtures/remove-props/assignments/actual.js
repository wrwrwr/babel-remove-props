a.prop3 = 3;
a.prop3 = prop1;

a.prop1 = 1;
a['prop2'] = '2';

a.prop1 = func1();
a['prop2'] = func2();

a.prop1 = a + (func3() && 5);
(j++).prop1 = 1;
a['prop2'] = i++;

try {
    (a + b * c).prop1 = 1;
    (a++).prop2 = 2;
    o.pure.prop1 = 1;
    o['pure'][2].prop2 = 2;
    o.impure.prop1 = 1;
    o['impure'][3].prop2 = 2;
    o.pure().prop1 = 1;
    o['pure'][2]().prop2 = 2;
    o.impure().prop1 = 1;
    o['impure'][3]().prop2 = 2;


    0;} catch (e) {g = 0;}  // WA: retainLines insists on the lack of newlines
                            //     before the closing brackets.
