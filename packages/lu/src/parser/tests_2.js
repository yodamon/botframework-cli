module.exports  = {
    testLU124 : `
    @ ml fooBar
`,

    testLU125 : `
    @ml fooBar
`,

    testLU126 : `
    @ml "foo bar" r1
    @ml 'a b' r2, r3
    @ml xyz hasRole r4
    @ml 123 hasRoles r5,r6
`,

    testLU127 : `
    @ml s1 r1, r1
`,

    testLU128 : `
    @ml a1 r1
    @regex a1 r2
`,

testLU129 : `
    @ml a1 r1
    @regex re1 a1
`,

testLU130 : `
    # test
    - this is a {foodType:r2}

    @ ml foodType r1
`,

testLU131 : `
    @ml ml
`,

testLU132 : `
    @ml entity1
    @entity1 r1

    @ml entity2
    @entity2 hasRole r2

    @ml entity3
    @entity3 hasRoles r3

    @ml entity4
    @entity4 hasRoles r4,r5
    @entity4 r6
`,

testLU133 : `
    @entity1 r1
`,

testLU134 : `
    @ml entity1 r1
    @ml entity2 r1
`,

testLU135 : `
    # test
    - this is a {value:r1 = test}

    @ml value r2
`,

testLU136 : `
    @ regex fooBar
`,

testLU190 : `
    @regex fooBar
`,

testLU137 : `
    @regex "foo bar" r1
    @regex 'a b' r2, r3
    @regex xyz hasRole r4
    @regex 123 hasRoles r5,r6
`,

testLU138 : `
    # test
    - this is a {foodType:r2}

    @ regex foodType r1
`,


testLU139 : `
    @regex regex
`,

testLU140 : `
    @regex entity1
    @entity1 r1

    @regex entity2
    @entity2 hasRole r2

    @regex entity3
    @entity3 hasRoles r3

    @regex entity4
    @entity4 hasRoles r4,r5
    @entity4 r6
`,

testLU141 : `
    @regex entity1 r1
    @regex entity2 r1
`,

testLU142 : `
    @regex r1 = /[0-9]{6}/
`,

testLU143 : `
    @regex r1 = /[0-9]{6}/
    @r1 = /[0-9]{7}/
`,


testLU144 : `
    @regex r1
    @r1 = /[0-9]{6}/
`,

testLU145 : `
    @regex r1
    @r1 = /[0-9]{6}/
    @r1 role1
    @r1 hasRole role2
    @r1 hasRoles role3, role4
`,

testLU146 : `
    @regex r1 =
        - /[0-9]{6}/
`,

testLU147 : `
    @regex foo = //
`,

testLU148 : `
    @ phraselist city disabled
    @ city =
        - Seattle
        - SEATAC
        - SEA
`,


testLU149 : `
    @ phraselist city
    @ city =
        - Seattle
        - SEATAC
        - SEA
    @ city disabled
`,

testLU150 : `
    > phrase list as feature to intent (also applicable to entities)
    @ intent getUserProfileIntent usesFeature city
    
    # getUserProfileIntent
    - test
    
    @ phraselist city
    @ city =
        - Seattle
        - SEATAC
        - SEA
    
    @ city enabledForAllModels
    @ city disabled
`,

testLU151 : `
    > phrase list as feature to intent (also applicable to entities)
    @ intent getUserProfileIntent usesFeature city
    
    # getUserProfileIntent
    - test
    
    @ phraselist city disabled, enabledForAllModels = 
        - Seattle
        - SEATAC
        - SEA
`,

testLU152 : `
    @phraselist xyz
`,


testLU153 : `
    @phraselist xyz = abc
`,

testLU154 : `
    @phraselist xyz(interchangeable)
`,

testLU155 : `
    @phraselist xyz = 
        - one
        - two
        - three
`,

testLU156 : `
    @phraselist xyz(interchangeable) = 
        - one
        - two
        - three
`,

testLU157 : `
    @phraselist xyz(interchangeable) hasRoles r1 = 
        - one
        - two
        - three
`,

testLU158 : `
    @phraselist xyz(interchangeable)
    @xyz hasRoles r1
`,

testLU159 : `
    @phraselist xyz = 
        - one, two
        - three, four
`,

testLU160 : `
    @phraselist xyz = 
        - one, two
    @phraselist xyz = 
        - three, four
`,

testLU161 : `
    @phraselist xyz = 
        - one,two
        - three, four
`,


testLU162 : `
    @phraselist xyz
    @xyz =
        - one,two
    @xyz =
        - three, four
`,

testLU163 : `
    @phraselist xyz(interchangeable)
    @xyz =
        - one,two
    @xyz =
        - three, four
`,

testLU164 : `
    @xyz = 
        - one, two
`,


testLU165 : `
    @prebuilt number
`,

testLU166 : `
    @prebuilt number age
`,

testLU167 : `
    @prebuilt number
    @number hasRole age
`,

testLU168 : `
    @prebuilt number
    @number hasRole age
    @number hasRoles r1, r2
`,


testLU169 : `
    # test
    - this is a {number=one}

    @prebuilt number
    @number hasRole age
    @number hasRoles r1, r2
`,

testLU170 : `
    @prebuilt xyz
`,

testLU171 : `
    @prebuilt personName
`,

testLU172 : `
    @composite name
`,

testLU173 : `
    @composite name hasRoles r1, r2
`,

testLU174 : `
    @composite name hasRoles r1, r2 = [child1, child2]
`,

testLU175 : `
    @composite name hasRoles r1, r2 = 
        - [child1, child2]
`,

testLU176 : `
    @composite name hasRoles r1, r2 = 
        - child1,child2
`,

testLU177 : `
    @composite name hasRoles r1, r2 = 
        - child1
        - child2
`,

testLU178 : `
    @composite name
    @name r1
    @name r2
    @name = 
        - child1
        - child2
`,

testLU179 : `
    @composite x1 = [s1, number]
    @ml s1
    @prebuilt number
    @composite x1 = [s1, age]
    @prebuilt age
`,

testLU180 : `
    @list x1
`,

testLU181 : `
    @list x1 r1, r2
`,


testLU182 : `
    @list x1 r1, r2 = 
        - a1:
            - one
            - two
        - a2:
            -three
            -four
`,

testLU183 : `
    @list x1
    @x1 r1
    @ x1 r2
    @ x1 =  
        - a1:
            - one
    @ x1 = 
        - a1:
            - one
            - two
    @x1 =
        - a2:
            -three, four
    @ x1 = 
        - a2:
            - three, four
    @x1 hasRoles a1, a2
`,

testLU184 : `
    @list x1 = 
        - red
`,

testLU185 : `
    # test
    - this is a {x1 = test}
    @list x1
`,

testLU186 : `
@ list blah=
    - something:
`,

testLU187 : `
    @patternany p1
`,

testLU188 : `
    @patternany p1 hasRoles r1, r2
`,

testLU189 : `
@ phraselist LeaveModifiers(interchangeable) = 
	- Change,cancel,replace,edit,remove,modify,delete,alter,change,drop

@ phraselist Durations(interchangeable) = 
	- days,day,month,months,weeks,week

@ phraselist "Months of the Year"(interchangeable) = 
- January,Jan,Feburary,Feb,March,Mar,April,Apr,May,June,Jun,July,Jul,August,Aug,September,Sep,Sept,October,Oct,November,Nov,December,Dec

@ ml Leave
    - @ ml LeaveType
    - @ ml LeaveDate
        - @ ml "Start Date" usesFeatures "Months of the Year"`,

testLU191 :`
    @ ml test
    # test
    - this is a {@test = one}
`,

testLU192 :`
    @ ml test r1
    # test
    - this is another one {@r1 = one}
`,

testLU193 :`
    @ml test r1, r2
    # test
    - this is another {test:r1 = one}
`,

testLU194 :`
    @ml test r1
    # test
    - this is another {test:r2 = one}
`,

testLU195 :`
    # test
    - this is another {@test = one}
`,

testLU196 :`
    # test
    - this is another {@from = one} from {@to = tokyo}
    
    @ ml x1 from, to
`,

testLU197:`
    # test
    - this is another {@test:x1 = one}
`,

testLU198 :`
    # test
    - this is a {@pattern}
`,

testLU199 :`
    # test
    - this is a {@r1}
    
    @patternany test r1
`,

testLU200 :`
    # test
    - this is a {@r1}
    
    @ml test r1
`,

testLU201 :`
    # test
    - this is a {@r1} from {@list1}
    
    @ml test r1
    @list list1 r2 =
        - one:
            - uno
`,

testLU202 :`
    # test
    - this is a {@r1} from {@r2}
    
    @ml test r1
    @list list1 r2 =
        - one:
            - uno
    
`,


testLU203 : `@ list foo=
@ ml operation=
    - @foo foo

# Test
- Pattern {foo}`,

testLU204 : `@ simple entity1`,

testLU205 : `> !# @app.tokenizerVersion = 1.0.2

# testIntent
- one
- two`,

testLU206 : `# Greeting
- hi {commPreference=test call}

$commPreference:simple
$commPreference:call=
- phone call`,

testLU207 : `# Greeting
- hi {commPreference}
$commPreference:simple
$commPreference:phraseList
- m&m,mars,mints,spearmings,payday,jelly,kit kat,kitkat,twix`,

testLU208 : `[test]()`,

testLU209 : `$p1:phraseList
- m&m,mars,mints,spearmings,payday,jelly,kit kat,kitkat,twix

$p1:phraseList interchangeable
- m&m,mars,mints,spearmings,payday,jelly,kit kat,kitkat,twix

`,

testLU210 : `$p1:phraseList
m&m,mars,mints,spearmings,payday,jelly,kit kat,kitkat,twix
`,

testLU211 : `$p1:t1=
m&m,mars,mints,spearmings,payday,jelly,kit kat,kitkat,twix
`,

testLU212 : `# test
- this is {one}
- this is {one}
`,

testLU213 : `$three : test :: a =
- foo
- bar
`,

testLU214 : `$three : test = a =
- foo
- bar
`,

testLU215 : `$three : test :: a = Roles=[from,to]
- foo
- bar
`,

testLU216 : `$product : simple

$product : phraseList
- one
- two
`,

testLU217 : `

$product : phraseList
- one
- two

$product : simple
`,

testLU218 : `

$product : phraseList
- one
- two

# test
- this is {product = one}
`,

testLU219 : `

$product : phraseList
- one
- two

# test
- this is {product = {type=sandwich}}

$product : [type]
`,

testLU220 : `

$number : phraseList
    - one
    - two

    # test
    - this is {number:first = one}

    $PREBUILT : number
`,

testLU221 : `

$number : phraseList
    - one
    - two

    # test
    - this is {number:first = one}

    $number : test=
    - one
    - two
`,

testLU222 : `

$number : phraseList
    - one
    - two

    # test
    - this is {number:first = one}

    $number : /one/
`,

testLU223 : `

$product : simple

$PREBUILT : number

$drinks:phraseList
    - tea, latte, milk

$product:phraseList
    - a, b, c
$EspressoType:Blonde ::201=
    - blonde
    - blond
`,

testLU224 : `

$project : simple

$project:phraseList
    - a, b, c

# Test
- this is a test {project=foo} utterance
`,

testLU225 : `# Test
- one {product:from=something}

$product:test=
- test`,

testLU226 : `## None
- here's an utterance {aListEntity:ThisIsARole=avalue} with a role in it

$aListEntity:some value= Roles=ThisIsARole
- avalue
`,

testLU227: `## None
- here's an utterance avalue with a role in it

$aListEntity:some value= Roles=ThisIsARole
- avalue

$MyComposite:[aListEntity:ThisIsARole]
`,

testLU228 : `$Country|Office:Argentina|ar::chc=
- Chaco
- chaco
`,

testLU229 :  `# test
- hello`,

testLU230 :  `# test
- I want a {foodType = tomato}`,

testLU231 :  `# test
- I want a {foodType=tomato}`,

testLU232 :  `# test
- I want {foodType}`,

testLU233 :  `# test
- I want a {foodType = tomato} and {foodType = orange}`,

testLU234 :  `# test
- I want a {foodType =tomato} and {foodType =orange}`,

testLU235 :  `# test
- I want {foodType} and {foodType}`,

testLU236 :  `# test
- {userName=vishwac}`,

testLU237 :  `# test
- {userName= vishwac}`,

testLU238 :  `# test
- {userName= vishwac
- userName= vishwac}`,

testLU239 :  `# test
- {userName}`,

testLU240 :  `# test
- {p = x {q = y}}

$ p : [q]`,

testLU241 :  `# test
- I want to {productOrder = buy a {product = shirt}} please

$ productOrder : [product]`,

testLU242 :  `# test
- I want {productOrder = another {product = shirt} and {product = pant} please}

$ productOrder : [product]`,

testLU243 :  `# test
- I want {p = x {q = y} and {r = a} with} {foodType=tomato} and {foodType=orange}

$ p : [q, r]`,

testLU244 :  `# test
- 1 {a = {b = {c = 2}}}`,

testLU245 :  `# test
- 1 {a = {b = {c = 2}}}
$a:[b]`,

testLU246 :  `## None
- {MyComposite:c1=here's an {Entity2:t1=utterance {Entity1:t2=avalue}}} with a composite in it
> here's an utterance avalue with a composite in it
> MyComposite:0,25; Entity2:10,25, Entity1:20,25
$Entity1:simple

$Entity2:simple

$MyComposite:[Entity1, Entity2]`,

testLU247 :  `## None
- {MyComposite=here's an {Entity2=utterance {Entity1=avalue}}} with a composite in it
> here's an utterance avalue with a composite in it
> MyComposite:0,25; Entity2:10,25, Entity1:20,25
$Entity1:simple

$Entity2:simple

$MyComposite:[Entity1, Entity2]`,

testLU248 :  `## RequestItem
- i need more {Item=water}

$Item:simple

$Item:phraseList interchangeable
- water,coffee`,

testLU249 :  `# intent1
- [[this]is] a new form (a | b)`,

testLU250 :  `# test
- one {protein = cheese} sandwich
    - one cheese sandwich
- tomato orange 
- one cheese {foodType = sandwich}
`,

testLU251 :  `# intent1
- this is a {number}

$ prebuilt : number`,

testLU252 :  `# intent1
- this is a {number:one}

$ prebuilt : number`,

testLU253 :  `# intent1
- this is a \\{test\\}
- this ia a test \\n`,

testLU254 :  `
# test
- no, i already have meeting {FromTime=3pm} {FromDate=tomorrow} afternoon
- no, i already have meeting {FromTime=3pm} {FromDate=tomorrow} afternoon
`,

testLU255 :  `
# test
- no, i already have meeting {FromTime=3pm} tomorrow afternoon
- no, i already have meeting {FromTime=3pm} {FromDate=tomorrow} afternoon
`,

testLU256 :  `$HRF-number:/hrf-[0-9]{6}/`,

testLU257 :  `$slash-colon:/[/:]/`,

testLU258 : `$slash-colon://:/`,

testLU259 :  `$test://`,

testLU260 :  `$test:/hrf-[0-9]{6}`,

testLU261 : `$test:/hrf-[0-9]{6}
$test:/udf-[0-9]{6}/`,

testLU262 : `$test:/hrf-[0-9]{6}
# test
- this is a {test=one} utterance`,

testLU263 :  `$test:/hrf-[0-9]{6}/
$test:/hrf-[0-9]{6}/`,

testLU264 : `$test:/hrf-[0-9]{6}/`,


testLU265 :  `# test
- what is the email id for {hrf-number}

$hrf-number:/hrf-[0-9]{6}/`,

testLU266 : `# test
- update {hrf-number:from} to {hrf-number:to}

$hrf-number:/hrf-[0-9]{6}/`,


testLU267 :  `@ age userAge`,

testLU268 :  `> # Intent definitions
## Book flight
- book flight from {geographyV2:fromCity=london} to {geographyV2:toCity=paris} on {datetimeV2:date=feb 14th}

> # Entity definitions
$PREBUILT:datetimeV2
$PREBUILT:geographyV2`,

testLU269 :  `> # Intent definitions
## Book flight
- book flight from {city:fromCity=london} to {city:toCity=paris} on {datetimeV2:date=feb 14th}

> # Entity definitions
$PREBUILT:datetimeV2
$city:london=
- london
- big apple

$city:paris=
- paris`,

testLU270 :  `> # Intent definitions
## Book flight
- book flight from {city:fromCity=london} to {city:toCity=paris} on {datetimeV2:date=feb 14th}

> # Entity definitions
$PREBUILT:datetimeV2
$city:/[a-A][0-9]/`,

testLU271 :  `> # Intent definitions
## Book flight
- book flight from {geographyV2=london} to {geographyV2=paris} on {datetimeV2:date=feb 14th}

> # Entity definitions
$PREBUILT:datetimeV2
$PREBUILT:geographyV2`,

testLU272 :  `> # Intent definitions
## Book flight
- book flight from {city=london} to {city=paris} on {datetimeV2:date=feb 14th}

> # Entity definitions
$PREBUILT:datetimeV2
$city:london=
- london
- big apple

$city:paris=
- paris`,

testLU273 :  `> # Intent definitions
## Book flight
- book flight from {city=london} to {city=paris} on {datetimeV2:date=feb 14th}

> # Entity definitions
$PREBUILT:datetimeV2
$city:/[a-A][0-9]/`,

testLU274 :  `# getUserName
- call me {name:userName}`,

testLU275 :  `# testIntent
- this is a : test intent {userName=vishwac}`,

testLU276 :  `# testIntent
- this is a = test intent {userName=vishwac}`,

testLU277 :  `# getUserName
- call me {name:userName}

$name: simple`,

testLU278 :  `> You can use roles in patterns using the entityName:role notation.
# getUserName
- call me {name:userName}
- I'm {name:userName}
- my name is {name:userName}

# getUserFirstName
> this is another role for the same 'name' entity
- [[my] first name is] {name:userFirstName}

# BookFlight
> roles can be specified for list entity types as well - in this case fromCity and toCity are added as roles to the 'city' list entity defined further below
- book flight from {city:fromCity} to {city:toCity}
- [can you] get me a flight from {city:fromCity} to {city:toCity}
- get me a flight to {city:toCity}
- I need to fly from {city:fromCity}

$city:Seattle=
- Seattle
- Tacoma
- SeaTac
- SEA

$city:Portland=
- Portland
- PDX

# setAlarm
> prebuilt entitities can have roles as well.
- create alarm for {datetimeV2:startTime}

# deleteAlarm
- remove the {datetimeV2:deleteTime} alarm

> This is just defining datetimeV2 as a prebuilt entity type. If an explicit type is not specified, by default entities in patterns will be set to pattern.any entity type
$PREBUILT:datetimeV2

# randomTestIntent
- test {entity:foo}

$entity: simple

`,

testLU279 :  `
$PREBUILT:datetimeV2

# testIntent
- set alartm at {datetimeV2=7AM}`,

testLU280 :  `
$location:redmond=
- redmond

# testIntent
- book a flight to {location=redmond}`,

testLU281 :  `
# test1
- book a flight to {location}

# testIntent
- book a flight to {location=redmond}`,

testLU282 :  `
$HRF-number:/hrf-[0-9]{6}/

# testIntent
- book a flight to {HRF-number=redmond}`,

testLU283 :  `
$flightBooking : [From, To]
$From:simple
$To:simple

# test
- book a flight {flightBooking:fromCity={From=london}}`,

testLU284 :  `
# test
- this is a {test:role1=test} utterance`,

testLU285 :  `# test 2
- this is a {test}

# test
- this is a test of {test:fromTime = 7AM}

`,

testLU286 :  `# foo
- this is {taskcontent = bar}
- this is a {taskcontent.any}
- this is {taskcontent = orange}     
`,

testLU287 :  `# test
- this is a test of {test:fromTime = 7AM}

$test:phraseList
- m&m,mars,mints,spearmings,payday,jelly,kit kat,kitkat,twix`,

testLU288 :  `# test
- this is a test of {test:role1 = {fromTime = 7AM}}

$test:[fromTime]`,

testLU289 :  `$name:simple roles=[firstname, lastname]
`,

testLU290 :  `$name:simple roles=[firstname, lastname]

# test 
- my middle name is {name:middlename=sena}`,

testLU291 :  `

# test 
- my middle name is {name:middlename=sena}

$name:simple roles=[firstname, lastname]`,

testLU292 :  `$PREBUILT:datetimeV2 roles=[fromDate, toDate]
`,

testLU293 :  `$PREBUILT:datetimeV2 roles=[fromDate, toDate]

# test 
- my first name is vishwac

$PREBUILT:datetimeV2 roles=[tempDate]`,

testLU294 :  `$PREBUILT:datetimeV2 roles=[fromDate, toDate]

# test 
- my first name is vishwac

$PREBUILT:number roles=[start, end]`,

testLU295 :  `
$location:seattle= roles=[fromCity,toCity]
    - seattle`,

testLU296 :  `
$location:seattle= roles=[fromCity]
    - seattle

# test
- test intent

$location:new york= roles=[toCity]`,

testLU297 :  `$HRF-number:/hrf-[0-9]{6}/ roles=fromNumber,toNumber`,

testLU298 :  `$HRF-number:/hrf-[0-9]{6}/ roles=fromNumber
$HRF-number:/hrf-[0-9]{6}/ roles=toNumber`,

testLU299 :  `$temperatureUnit : [device, temperature] roles=from, to
$device : simple
$PREBUILT : temperature`,

testLU300 :  `$temperatureUnit : [device, temperature] roles=from
$device : simple
$PREBUILT : temperature
$temperatureUnit : [device, temperature] roles=to`,

testLU301 :  `$Want:PhraseList roles=[foo,bar]
- require, need, desire, know`,

testLU302 : `$userName:simple role=firstName`,

testLU303 : `$PREBUILT:datetimeV2 role=fromDate`,

testLU304 : `$location:seattle= role=fromCity
- seattle`,

testLU305 : `$temperatureUnit : [device, temperature] roles=from`,

testLU306 : `# test
- set alarm for {time:fromTime}`,

testLU307 :  `> # Intent definitions

## Intent
- holiday request to {datetimeV2:to=next day}
- holiday request vacation from {datetimeV2:from=today}
- i want vacation from {datetimeV2:from} until {datetimeV2:to}

> # Entity definitions

> # PREBUILT Entity definitions

$PREBUILT:datetimeV2 Roles=to, from`,

testLU308 :  `> # Intent definitions

## Intent
- holiday request to {regex1:to=32}
- holiday request vacation from {regex1:from=today}
- i want vacation from {regex1:from} until {regex1:to}

> # Entity definitions

> # PREBUILT Entity definitions

$regex1:/[0-9]/ Roles=to, from`,

testLU309 :  `> # Intent definitions

## Intent
- holiday request to {list1:to=32}
- holiday request vacation from {list1:from=today}
- i want vacation from {list1:from} until {list1:to}

> # Entity definitions

> # PREBUILT Entity definitions

$list1: a = Roles = to, from
    - 32
`,


}
