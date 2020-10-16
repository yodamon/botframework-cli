module.exports  = {
    testLU1 : `> !# @app.name = all345
> !# @app.desc = this is a test
> !#  @app.culture = en-us
> !# @app.versionId = 0.4
> !# @app.luis_schema_version = 3.2.0

# test 
- greeting`,
    testLU2 : `> !# @app.settings.NormalizeDiacritics = true
> !# @app.settings.NormalizePunctuation = True
> !# @app.settings.UseAllTrainingData = true

# test
- one`,
    testLU3: `> !# @parser.OnAmbiguousLabels = takeFirst

# test
- {@cuisineEntity=chinese cuisine}

# test
- {@cuisineEntity=chinese} cuisine
`,
    testLU4: `> !# @parser.OnAmbiguousLabels = takeLast

# test
- {@cuisineEntity=chinese cuisine}

# test
- {@cuisineEntity=chinese} cuisine`,
    testLU5: `> !# @parser.OnAmbiguousLabels = throwAnError

# test
- {@cuisineEntity=chinese cuisine}

# test
- {@cuisineEntity=chinese} cuisine`,
    testLU6: `> !# @parser.OnAmbiguousLabels = takeLongestLabel

# test
- {@cuisineEntity=chinese cuisine}

# test
- {@cuisineEntity=chinese} cuisine`,
    testLU7: `# test
- {@cuisineEntity=chinese cuisine}

# test
- {@cuisineEntity=chinese} cuisine`,
    testLU8 : `
@ml "foo bar"
@ml 'a b'
`,
    testLU9: `
@regex "foo bar"
@regex 'a b'
`,
    testLU10: `
@patternany "foo bar"
@patternany 'a b'
`,
    testLU11: `
@list "foo bar"
@list 'a b'
`,
    testLU12: `
@composite "foo bar"
@composite 'a b'
`,
    testLU13: `
@phraselist "foo bar"
@phraselist 'a b'
`,
    testLU14: `$deviceTemperature : [`,

    testLU15: `$deviceTemperature : []`,

    testLU16: `
$deviceTemperature : [bar]
$deviceTemperature : [foo]`,

    testLU17: `$deviceTemperature : [child1, child2]`,

    testLU18: `$deviceTemperature : [child1; child2]`,

    testLU19: `$deviceTemperature : [p1; child2]
    # testIntent
    - I'm {p1}`,

    testLU20: `$deviceTemperature : [p1; child2]
    $deviceTemperature:simple`,

    testLU21:`$deviceTemperature : [p1; child2]`,

    testLU22: `
$deviceTemperature : [p1; child2]
# test
- this is a test with {p1=vishwac}`,

    testLU23: `
$device : thermostat=
    - Thermostat
    - Heater
    - AC
    - Air conditioner

$device : refrigerator=
    - Fridge
    - Cooler

$customDevice : simple

$PREBUILT : temperature

$deviceTemperature: [device, customDevice, temperature]

# setThermostat
    - Please set {deviceTemperature = thermostat to 72}
    - Set {deviceTemperature = {customDevice = owen} to 72}`,

    testLU123: `
$device : thermostat=
    - Thermostat
    - Heater
    - AC
    - Air conditioner

$device : refrigerator=
    - Fridge
    - Cooler

$customDevice : simple
$PREBUILT : temperature

# setThermostat
    - Please set {deviceTemperature = thermostat to 72}
    - Set {deviceTemperature = {customDevice = owen} to 72}

$deviceTemperature: [device, customDevice, temperature]`,

    testLU24: `
# Test
- {p = {q}}`,

    testLU25:`
# Test
- zero {foo = one {one = two} three} four

$ foo : [one]`,

    testLU26: `
## Repros
- when I use the {@outer=same {@inner=text} twice in nested ML entity text}

@ ml outer 
    - @ ml inner`,

    testLU27:`
# test
- one 
@ intent test usesFeature test
`,

    testLU28: `
    @ intent xyz usesFeature abc

    # xyz 
    - test
`,

    testLU29:`
@ intent xyz usesFeature abc

# xyz 
- test

# abc
- foo
`,

    testLU30:`
@ intent abc usesFeature simple1
@ ml simple1
# abc 
- test
`,

    testLU31:`
@ intent abc usesFeature number
@ prebuilt number
# abc 
- test
`,

    testLU31: `
@ intent abc usesFeature number
@ list number
# abc 
- test
`,

    testLU32: `
@ intent abc usesFeature number
@ composite number
# abc 
- test
`,

    testLU32: `
@ intent abc usesFeature number
@ regex number
# abc 
- test
`,

    testLU33: `
# test
- one

@ ml simple1
@ intent test usesFeature simple1

@ regex regex1
@ intent test usesFeature regex1

@ list list1
@ intent test usesFeature list1

@ composite c1
@ intent test usesFeature c1

@ prebuilt number
@ prebuilt age
@ intent test usesFeatures number, age

@ phraselist pl1 = 
    - one
    - two
@ intent test usesFeatures pl1, test2
# test2
- abc
`,

    testLU34: `
# test
- one

@ ml simple1
@ intent test usesFeature simple1

@ regex regex1
@ intent test usesFeature regex1

@ list list1
@ intent test usesFeature list1

@ composite c1
@ intent test usesFeature c1

@ prebuilt number
@ prebuilt age
@ intent test usesFeatures number, age

@ phraselist pl1 = 
    - one
    - two
@ intent test usesFeature pl1, number, age, c1, list1, regex1,simple1, test2

# test2
- abc
`,

    testLU35: `
@ ml s1
@ s1 usesFeature s1
`,

    testLU36: `
@ ml abc usesFeature simple1
@ ml simple1
`,

    testLU37: `
@ ml abc usesFeature simple1
@ regex simple1
`,

    testLU38: `
@ ml abc usesFeature simple1
@ list simple1
`,

    testLU39: `
@ ml abc usesFeature simple1
@ composite simple1
`,

    testLU40: `
@ ml abc usesFeature number
@ prebuilt number
`,

    testLU41: `
@ list l1 usesFeature s2
@ ml s2 usesFeature l1
`,

    testLU42: `
# test
- abc

# test1
- xyz

# test2
- 123

> test::test test -> test1 -> test2 -> s1 -> test
@ intent test usesFeature test1

> test1::test test1 -> test2 -> s1 -> test
@ intent test1 usesFeature test2

> test2::test test2 -> s1 -> test
@ intent test2 usesFeature s1

> s1::test s1 -> test
@ ml s1
@ s1 usesFeature test
`,
    testLU43:`
@ intent xyz hasRoles r1
`,

    testLU44: `
## None
- all of them
- i want them all
- i want to all of them

@ intent None
`,
    
    testLU44: `
@ intent getUserProfileIntent usesFeature city

@ phraselist city(interchangeable) = 
    - seattle
    - space needle
    - SEATAC
    - SEA
`,
    testLU45:`
> phrase list as feature to intent (also applicable to entities)
@ intent getUserProfileIntent usesFeature city

# getUserProfileIntent
- test
`,

    testLU45: `
> phrase list as feature to intent (also applicable to entities)
@ intent getUserProfileIntent usesFeature city

# getUserProfileIntent
- test

@ phraselist city(interchangeable)
@ city =
    - Seattle
    - SEATAC
    - SEA
`,
    
    testLU46:`
@ phraselist pl1(interchangeable) 
@ pl1 disabled, disabledForAllModels
`,

    testLU47:`
> phrase list as feature to intent (also applicable to entities)
@ intent getUserProfileIntent usesFeature city

# getUserProfileIntent
- test

@ phraselist city
@ city =
    - Seattle
    - SEATAC
    - SEA
`,

    testLU48:`
> phrase list as feature to intent (also applicable to entities)
@ intent getUserProfileIntent usesFeature city, city2

# getUserProfileIntent
- test

@ phraselist city
@ city =
    - Seattle
    - SEATAC
    - SEA
@ phraselist city2(interchangeable)
@ city2 =
    - portland
    - PDX
`,

    testLU49: `
    @ ml x1
    @ x1 usesFeature city3
`,

    testLU50:`
@ x1 usesFeature city3
`,

    testLU51: `
@ phraselist city
@ city =
    - Seattle
    - SEATAC
    - SEA
@ phraselist city2(interchangeable)
@ city2 =
    - portland
    - PDX

@ ml x1
@ x1 usesFeature city
`,

    testLU51: `
@ phraselist city
@ city =
    - Seattle
    - SEATAC
    - SEA
@ phraselist city2(interchangeable)
@ city2 =
    - portland
    - PDX

@ ml x1
@ x1 usesFeature city, city2
`,

    testLU52:`
@ phraselist city
@ city =
    - Seattle
    - SEATAC
    - SEA
@ phraselist city2(interchangeable)
@ city2 =
    - portland
    - PDX

@ ml number hasRoles r1 usesFeature city 
@ number usesFeature city
`,

    testLU53: `
@ phraselist city
@ city =
    - Seattle
    - SEATAC
    - SEA
@ phraselist city2(interchangeable)
@ city2 =
    - portland
    - PDX

@ ml number hasRoles r1, r2 usesFeatures city, city2 
@ number usesFeature city
`,

    testLU54:`
@ prebuilt number usesFeature city
@ phraselist city =
    - Seattle
    - SEATAC
    - SEA
`,

    testLU55: `
@ list number usesFeature city
@ phraselist city =
    - Seattle
    - SEATAC
    - SEA
`,

    testLU56: `
@ patternany number usesFeature city
@ phraselist city =
    - Seattle
    - SEATAC
    - SEA
`,

    testLU57: `
@ regex number usesFeature city = /[0-9]{7}/
@ phraselist city =
    - Seattle
    - SEATAC
    - SEA
`,

    testLU58: `
@ composite x1
@ x1 usesFeature city3
`,

    testLU59:`
@ x1 usesFeature city3
`,

    testLU60: `
@ phraselist city
@ city =
    - Seattle
    - SEATAC
    - SEA
@ phraselist city2(interchangeable)
@ city2 =
    - portland
    - PDX

@ composite x1 = [s1, number]
@ x1 usesFeature city
@ ml s1
@ prebuilt number
`,

    testLU61:`
@ phraselist city
@ city =
    - Seattle
    - SEATAC
    - SEA
@ phraselist city2(interchangeable)
@ city2 =
    - portland
    - PDX

@ composite x1 = [s1, number]
@ x1 usesFeatures city, city2
@ ml s1
@ prebuilt number
`,

    testLU62: `
@phraselist xyz =
    - a
    - b
    - c
@phraselist abc usesFeature xyz = 
    - 1
    - 2
    - 3
`,
    
    testLU63: `
@ patternany p1
# test
- one
@ intent test usesFeature p1
`,

    testLU64: `
@ patternany p1
@ ml s1 usesFeature p1
`,

    testLU65:`
@ patternany p1
@ composite c1 usesFeature p1
`,
    testLU66:`
@ ml c1
@ phraselist p1 usesFeature c1
`,

    testLU67: `
@ ml s1
@ regex r1 usesFeature s1
`,

    testLU68:`
@ ml s1
@ list r1 usesFeature s1
`,
    testLU69: `
@ ml s1
@ prebuilt number usesFeature s1
`,

    testLU70: `
@ ml s1
@ list l1
@ composite c1
@ prebuilt number
@ regex r1
@ phraselist PL1
# test
- one
@ intent test usesFeatures s1, l1, c1, number, r1, PL1
# test2
- one
@ s1 usesFeature test2, l1, c1, number, r1, PL1
@ c1 usesFeature test2, l1, number, r1, PL1, s1
`,
    
    testLU71: `
## Demo
- demo

@ ml "phone number entity" usesFeature phonePL

@ phraselist phonePL(interchangeable) = 
    - phone,phone number,telephone,cellphone
`,
    
    testLU72: `
@ phraselist "phone pl"(interchangeable) = 
    - phone,phone number,telephone,cellphone
`,
    testLU73: `
@ list "my city"
`,
    testLU74: `
@ composite "test composite"
`,
    testLU75: `
@ regex "test regex"
`,
    testLU76:`
@ patternany "test pa"
`,
    testLU77: `
# test intent
- foo

@ ml "test ml entity"

@ phraselist "test pl"

@ ml "another entity" usesFeatures "test intent", "test ml entity", "test pl"`,
    
    testLU78: `
# test intent
- foo

@ ml bar

@ intent "test intent" usesFeature bar`,

    testLU79:`
# test intent
- I want {@food type = tomato}

@ ml 'food type'`,

    testLU80:`
@ ml "entity 1" hasRoles "role 1", "role 2"
`,
    testLU81: `
@ ml "entity 1" hasRoles "role 1", "role 2"

# test intent
- I want {@role 1 = something}
`,

    testLU82: `
@ ml fooBar
`,
    testLU83: `
@ ml 'foo Bar'
`,

    testLU84:`
@ ml fooBar r1
@ ml fooBar2 2r1, 2r2
@ ml fooBar3 hasRole 3r1
@ ml fooBar4 hasRoles 4r1, 4r2
@ ml fooBar5
@ fooBar5 5r1
`,
    testLU85: `
@ ml fooBar r1
@ ml fooBar2 fooBar
`,
    testLU86:`
@ ml fooBar
# intent1
- test
@fooBar usesFeature intent1
`,
    testLU87: `
@ ml fooBar
# intent1
- test
@fooBar usesFeature intent1
`,
    testLU88: `
@ ml fooBar
@ ml x1
@ prebuilt number
@ list l1
@ composite c1
@ regex r1
@fooBar usesFeatures x1, number, l1, c1, r1
`,
    testLU89: `
@ ml fooBar
@ phraselist p1
@fooBar usesFeatures p1
`,
    testLU90: `
@ ml fooBar r1
@ patternany p1
@ fooBar usesFeature p1
`,
    testLU91: `
@ml xyz = 
    - @ ml x1
    - @ ml abc =
        - number p1
`,
    testLU92: `
@ml xyz = 
    - @ ml x1
    - @ ml abc =
        - @number
`,
    testLU93: `
@ml xyz = 
    - @ ml x1
    - @ ml abc =
        - @ number r1 usesFeaturex p1
`,
    testLU94: `
@list xyz
@ml xyz = 
    - @ ml x1
`,
    testLU95: `
@ml xyz1 = 
    - @ ml xyz

`,
    testLU96: `
@ml xyz1 = 
    - @ ml 'x y z'
`,
    testLU97: `
@regex r1
@ml xyz1 = 
- @r1 xyz
    - @ml xyz2

`,
testLU98: `
    @ml xyz1 = 
        - @ ml xyz
        - @ ml xyz2

`,
    testLU99: `
@prebuilt number
@ml xyz1 = 
- @ ml xyz
- @ number abc

`,
    testLU100: `
@ list list1
@ list list2
@ list list3
@ list list4
@ regex regex1
@ regex regex2
@ prebuilt number
@ml 1 = 
    - @ ml s1
    - @ ml 2 =
        - @ number n2
        - @ml 3 =
            - @ list1 l3
            - @ml 4 =
                - @ regex1 r4
                - @ ml 5 =
                    - @ regex2 r5
                    - @ list2 l5
                    - @ number n5
                    - @ ml s5
                - @ list3 l4
                - @ number n4
                - @ ml s4
            - @ number n3
            - @ ml s3
        - @ ml s2
`,
    testLU101:`
@ list list1
@ list list2
@ list list3
@ list list4
@ regex regex1
@ regex regex2
@ prebuilt number
@ml 1 = 
    - @ ml s1
    - @ ml 2 =
        - @ number n2
        - @ml 3 =
            - @ list1 l3
            - @ml 4 =
                - @ regex1 r4
                - @ ml 5 =
                    - @ regex2 r5
                    - @ list2 l5
                    - @ number n5
                    - @ ml s5
                - @ list3 l4
                - @ number n4
                - @ ml s4
            - @ number n3
            - @ ml s3
        - @ ml s2`,

    testLU102: `
@ list list1
@ list list2
@ list list3
@ list list4
@ regex regex1
@ regex regex2
@ prebuilt number
@ml 1 = 
    - @ ml s1
    - @ ml 2 =
        - @ number n2
        - @ml 3 =
            - @ list1 l3
            - @ml 4 =
                - @ regex1 r4
                - @ ml 5 =
                    - @ regex2 r5
                    - @ list2 l5
                    - @ number n5
                    - @ ml s5
                - @ list3 l4
                - @ number n4
                - @ ml s4
            - @ number n3
            - @ ml s3
        - @ ml s2`,

    testLU103:  `
@ml 1 = 
    - @ ml s1 usesFeature x1
@regex x1
        
`,
    testLU104:`
@ml 1 = 
    - @ ml s1 usesFeature x1, x2
@regex x1
@regex x2
`,
    testLU105: `
@ml 1 = 
- @ list1 l1
`,

    testLU106: `
@ list list1
@ml 1 = 
- @ list1 l1
- @ ml 
`,

    testLU107:`
@ ml fooBar
    - @ pl1 x1
@ phraselist pl1`,

    testLU108: `
@ ml fooBar
    - @ pa1 x1
@ patternany pa1`,

    testLU109: `
@ ml fooBar
    - @ r1 x1
@ ml pl1 r1
`,

    testLU110: `
@ ml fooBar
    - @ ml x1 usesFeature pa1
@ patternany pa1
`,

    testLU111: `
@ ml fooBar
- @ ml x1 usesFeature pa1
`,

    testLU112: `
@ ml fooBar
    - @ ml x1 usesFeature pa1
# pa1
- one  
`,

    testLU113: `
@ ml fooBar
    - @ ml x1 usesFeature pl1
@ phraselist pl1
`,
    testLU114: `
@ ml fooBar
    - @ ml x1 usesFeature pl1, s1, number
@ phraselist pl1
@ ml s1
@ prebuilt number
    `,

    testLU115: `
## None
## intent1
@ ml nDepth usesFeatures intent1,phraselist1
    - @ age nDepth_child1
    - @ ml nDepth_child2 usesFeatures intent1,phraselist1
        - @ ml nDepth_child2.1
@ prebuilt age
@ phraselist phraselist1(interchangeable) = 
    - who,why,where,what
`,

    testLU116: `
@ml 1
@prebuilt number
@list list1
@1 =
- @ number from
- @ list1 myList
`,
    testLU117: `
# test
- my name is vishwac
    - my {@userProfile = name is vishwac}
    - my name is {@userName = vishwac}
- I'm 36
    - I'm {@userProfile = {@userAge = 36}}

@ ml userProfile = 
    - @ personName userName
    - @ age userAge

@ prebuilt personName
@ prebuilt age`,
        
    testLU118: `
@ ml userProfile
- @ number number
- @ personName name

@ prebuilt number
@ prebuilt personName

# userProfile
- I'm {@userProfile = {@number = 36}} years old
        `,
    testLU119: `
# test
- {@AddToQuantity={@PROPERTYName=Quantity} is {@number=99}}

@ml AddToQuantity = 
    - @number number
    - @PROPERTYName PROPERTYName

@ list PROPERTYName
    - Quantity:
		- property

@ prebuilt number
`,

    testLU120: `
# test
- add {@AddToQuantity={@number=1000}}

@ml AddToQuantity = 
    - @number number
    - @PROPERTYName PROPERTYName
@ml RemoveFromQuantity = 
    - @number number
    - @PROPERTYName PROPERTYName

@ list PROPERTYName
    - Quantity:
		- property

@ prebuilt number
        `,
    testLU121:  `
# test
- remove {@RemoveFromQuantity={@number=99}}

@ml AddToQuantity = 
    - @number number
    - @PROPERTYName PROPERTYName
@ml RemoveFromQuantity = 
    - @number number
    - @PROPERTYName PROPERTYName

@ prebuilt number hasRole Quantity
@ list PROPERTYName
    - Quantity:
		- property

`,
    testLU122:  `
# test
- add {{@AddToSauces={@SaucesEntity=yellow}}, {{@AddToSauces={@SaucesEntity=mustard}} and {{@AddToSauces={@SaucesEntity=yellow}}
- add {{@AddToSauces={@SaucesEntity=mustard}}, {{@AddToSauces={@SaucesEntity=mustard}} and {{@AddToSauces={@SaucesEntity=dijon mustard}}
- add {{@AddToSauces={@SaucesEntity=mustard}}, {{@AddToSauces={@SaucesEntity=yellow}} and {{@AddToSauces={@SaucesEntity=pepper}}

@ml AddToSauces = 
    - @ml SaucesEntity
`
}
