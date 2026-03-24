import { requireAuth } from '@/lib/auth'
import { Page, PageContent } from '@/components/layout/Page'
import { HandbookNavigation } from '@/components/layout/HandbookNavigation'
import { HighlightContent } from '@/components/layout/HighlightContent'
import { CocktailGrid } from '@/components/handbook/CocktailGrid'
import { HandbookNav } from '@/components/handbook/HandbookNav'
import { HandbookHeader } from '@/components/handbook/HandbookHeader'
import { CompactBookSelector } from '@/components/handbook/CompactBookSelector'
import { BackToTop } from '@/components/handbook/BackToTop'
import { HandbookContentsList } from '@/components/handbook/HandbookContentsList'
import {
  HandbookLandingWithSearchOverlay,
  HandbookBookViewWithSearchOverlay,
} from '@/components/handbook/HandbookSearchArea'

export default async function HandbookPage({
  searchParams,
}: {
  searchParams: { book?: string; section?: string; highlight?: string }
}) {
  await requireAuth()

  // Define all books
  const books = [
    {
      id: 'spirit-guide',
      title: 'Spirit Guide',
      sections: [
        {
          id: 'the-bar-host',
      title: 'The Bar Host',
      content: (
        <>
          <p>First impressions are the most important. For us that starts at the bar. If you cannot please the customers within the first 5 minutes then you have already lost them. This chapter will show you how to make your impression count.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Friendly faces start with a smile!</h3>
          <p>First thing a customer should see is our staff smiling and asking "Hi, how can I help?". This will help us find out if they have a booking, looking to book or just wanting drinks. By asking if you can help them, it makes the conversation personal rather than just seeing if they have a booking. It is a great way to start a good experience at Spirits.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Coasters down!</h3>
          <p>Once you know what the guest is here for, lets get the most important order in, the first round. Ask "would like you like any drinks before you start?" And lay down enough coasters for each one of the guests in front of them. This encourages all of them to get a drink as the coaster indicates you have already started. More often than not they will at least get something as that coaster is down.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Don't forget to wipe!</h3>
          <p>Once the drinks have been made, get your cloth and wipe down any spillage or condensation left on the bar. This not only keeps the bar clean but it also gives the customer the peace of mind you are a clean venue and then in turn will treat it as such.</p>
          
          <p className="mt-6 italic text-spirits-cyan font-medium">"the experience starts at the door, make an impression"</p>
          
          <p className="mt-6">With all of that you have started a great customer experience. From your cocktails, your perfect pint pour to the way you keep the bar clean. Now for the next bit, hosting a game. Each game requires slightly different hosting styles, a group for karaoke will be different from a group for axe throwing.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Check ups!</h3>
          <p>During a customers activity we should do regular check ups. Ideally every 20 minutes. This is to check how they are getting on, who's winning, clearing empty glasses and to see if they need any more drinks. Do yourself a favour and bring a PDQ with you and take there order right then and there.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Game table service.</h3>
          <p>As stated before, while someone is on an activity you want to check if they are looking to get more drinks. Treat these customers like they are guest at a restaurant, you will be bringing whatever they need to the activity they are on so they never have to interrupt their game they have paid for.</p>
        </>
      ),
    },
    {
      id: 'smile',
      title: 'S.M.I.L.E.',
      content: (
        <>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                <span className="text-spirits-cyan">S</span> – Smile and Greet
              </h3>
              <p>Always start with a smile and a warm "Hi, how can I help?" to create a personal and welcoming atmosphere.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                <span className="text-spirits-cyan">M</span> – Make it Personal
              </h3>
              <p>Understand why the guest is here—booking, playing, or just drinks. Tailor the experience to them.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                <span className="text-spirits-cyan">I</span> – Initiate the First Round
              </h3>
              <p>Offer the first drink order promptly by laying down coasters. This signals readiness to serve and encourages orders.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                <span className="text-spirits-cyan">L</span> – Look After the Bar
              </h3>
              <p>Wipe up spills, keep everything clean and tidy. A spotless bar reassures guests and sets the tone for their experience.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                <span className="text-spirits-cyan">E</span> – Engage Throughout
              </h3>
              <p>Do regular check-ins, offer to take drink orders with a PDQ, and provide table service for activities. Keep the guest's experience flowing seamlessly.</p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'the-cocktails',
      title: 'The Cocktails',
      content: (
        <>
          <p>Cocktails are a staple at any bar, especially a leisure one like Spirits. Making these with confidence, with a little flair and some banter, you will improve a customers experience tenfold.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Promotional Cocktails</h3>
          <p>Every now and then we will run a promotional cocktail, such as on valentines day or in the Christmas period. These will be shown as and when they are launched and are only temporary.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Can't remember something?</h3>
          <p>Make sure to follow the cocktail spec sheet if you are unsure. You can always have a reminder of the ingredients by selecting the cocktail on the PDQ, you'll find the ingredients located at the bottom of the page.</p>
          
          <p className="mt-6 italic text-spirits-cyan font-medium">"Pour yourself into your craft, and watch the bar come alive."</p>
          
          <div className="mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            <CocktailGrid
              cocktails={[
                {
                  name: "5* Tea",
                  ingredients: "12.5ml White Rum, 12.5ml Gold Rum, 12.5ml Spiced Rum, 12.5ml Dark Rum, 12.5ml Wray & Nephew, 50ml Sweet & Sour, Top with Pepsi",
                  method: "Shake all rums and sweet & sour in a shaker with ice. Strain into glass, with ice and top with Pepsi.",
                  garnishGlass: "Lime Wedge. Collins/Hurricane"
                },
                {
                  name: "Aperol Spritz",
                  ingredients: "50ml Aperol, 100ml Prosecco, Top with Soda",
                  method: "Build into glass, Aperol, Prosecco and Ice. Top with Soda",
                  garnishGlass: "Orange Wheel. Gin Balloon."
                },
                {
                  name: "Blue Lagoon",
                  ingredients: "25ml Vodka, 25ml Blue Curacao, Top with Lemonade",
                  method: "Build into glass, Vodka and Blue curacao. Ice and then top with lemonade.",
                  garnishGlass: "Lemon Wedge. Hurricane/Sling."
                },
                {
                  name: "Bramble",
                  ingredients: "50ml Gin, 25ml Lemon Juice, 12.5ml Sugar Syrup, Drizzle Crème de Cassis",
                  method: "Add Gin, lemon juice and sugar syrup to glass and stir with spoon. Add crushed Ice. Then drizzle a small amount of crème de Cassis on the top.",
                  garnishGlass: "Lemon Wedge. Rocks Glass."
                },
                {
                  name: "Cosmopolitan",
                  ingredients: "37.5ml Vodka, 12.5ml Triple Sec, 12.5ml Lime, 50ml Cranberry Juice",
                  method: "Shake all ingredients together with ice. Double strain into a glass.",
                  garnishGlass: "Lime or Orange. Martini Glass"
                },
                {
                  name: "Daiquiri Flavours (Mango + Raspberry)",
                  ingredients: "37.5ml White Rum, 12.5ml Flavour rum, 50ml Flavour Puree, 25ml Gomme, 50ml Lime Juice",
                  method: "Shake all ingredients together with ice. Fill a glass with crushed ice and strain shaker into glass.",
                  garnishGlass: "Lime Wedge. Hurricane/Sling."
                },
                {
                  name: "Daiquiri (Bubble Gum)",
                  ingredients: "50ml White Rum, 50ml Bubble-gum, 25ml Sugar Syrup, 50ml Apple Juice",
                  method: "Shake all ingredients together with ice. Fill a glass with crushed ice and strain shaker into glass.",
                  garnishGlass: "Lime Wedge. Hurricane/Sling."
                },
                {
                  name: "God Father",
                  ingredients: "25ml Disaronno, 25ml Jim Bean, Top with Pepsi",
                  method: "Add Disaronno and Jim Bean to a glass. Fill with ice and top with Pepsi.",
                  garnishGlass: "Lemon Wedge. Hurricane/Sling/Collins"
                },
                {
                  name: "Jelly Baby",
                  ingredients: "12.5ml Vodka, 12.5ml Archers, 12.5ml Malibu, 12.5ml Blue Curacao, 12.5ml Grenadine, 100ml Pineapple",
                  method: "Shake Vodka, Archers, Malibu and Blue Curacao with ice in a shaker. Get a glass with the 12.5ml grenadine in the bottom, fill with ice and add pineapple. Then strain shaker on top. Should all sit in 3 different colours.",
                  garnishGlass: "Lemon Wedge. Hurricane/Sling. Crushed Ice cap"
                },
                {
                  name: "Largerita",
                  ingredients: "25ml Tequila, 25ml Triple Sec, 25ml Lime, Top with Corona",
                  method: "Shake tequila, triple sec and lime in a shaker with ice. Strain into glass full of ice. Then Top with Corona.",
                  garnishGlass: "Lime wedge. Tiki Glass."
                },
                {
                  name: "Mango Margarita",
                  ingredients: "25ml Tequila, 15ml Triple Sec, 35ml Mango Puree, 50ml Lemon Juice, Drop of Grenadine",
                  method: "Shake all ingredients together with ice. Add grenadine to bottom of glass. Double strain.",
                  garnishGlass: "Lemon wedge. Margarita Glass"
                },
                {
                  name: "Mango Sunrise",
                  ingredients: "37.5ml Tequila, 12.5ml Triple Sec, 1 Can Monster Mango",
                  method: "Get a can of Monster Mango and pour out about 3 shots (75ml) Then add all ingredients to the can.",
                  garnishGlass: "Monster Can. Lime Wedge."
                },
                {
                  name: "Mojito + Flavours (Passion fruit + Raspberry)",
                  ingredients: "Normal: 50ml Rum, 5 Lime Wedges, 6-8 Mint leaves, 12.5ml Gomme, Top with Soda. Flavours: 37.5ml White Rum, 12.5ml Flavour of Rum, 5 Lime Wedges, 6-8 Mint leaves, 25ml of flavour puree",
                  method: "Add lime wedges to glass with gomme, muddle the lime and gomme. Clap mint and add to glass, with rums (if doing flavour, add puree) with crushed ice half way. Stir well! Fill with crushed ice and top with a little soda water.",
                  garnishGlass: "Collins. Lime wedge and mint sprig."
                },
                {
                  name: "Porn Star",
                  ingredients: "25ml Passionfruit Rum, 25ml Vanilla Vodka, 25ml Passion fruit puree, 12.5ml Sugar Syrup, 25ml Orange, 25ml Prosecco (on side)",
                  method: "Shake all ingredients together with ice (not prosecco). Double strain into glass.",
                  garnishGlass: "Martini Glass. Prosecco in a shot glass on the side."
                },
                {
                  name: "Sex On The Beach",
                  ingredients: "25ml Vodka, 25ml Archers, Top half Orange and Cranberry",
                  method: "Build all ingredients into the glass and fill with ice. Top with half orange and cranberry",
                  garnishGlass: "Orange wheel. Collins/Sling/Hurricane."
                },
                {
                  name: "Tropical Punch",
                  ingredients: "25ml Midori, 25ml Malibu, 6 lime wedges, Top with Pineapple",
                  method: "Add limes to glass and muddle them. Then add Midori and Malibu, fill glass with ice and then top with pineapple juice.",
                  garnishGlass: "Lime wedge. Collins."
                },
                {
                  name: "Woo Woo",
                  ingredients: "25ml Vodka, 25ml Archers, Fill with Cranberry",
                  method: "Build all ingredients into the glass and fill with ice. Top with cranberry",
                  garnishGlass: "Lime wedge. Sling/Hurricane."
                },
                {
                  name: "Zombie",
                  ingredients: "25ml White Rum, 12.5ml Wray & Nephew, 12.5ml Dark Rum, 25ml Sweet n Sour, 50ml Pineapple Juice, Dash Grenadine",
                  method: "Shake all ingredients in a shaker with ice. Strain into a glass full of ice. Drizzle Grenadine over the top",
                  garnishGlass: "Lime Wedge. Hurricane/Skull glass. Crushed Ice cap"
                },
                {
                  name: "Vimto Nojito",
                  ingredients: "3 limes, 12.5ml Sugar Syrup, Top with Vimto, Approx 6 mint leaves",
                  method: "Muddle 3 limes and sugar syrup, added crushed ice, stir, add more ice and top with Vimto.",
                  garnishGlass: "Lime wedge",
                  isMocktail: true
                },
                {
                  name: "Wannabe Pornstar",
                  ingredients: "50ml Orange Juice, 12.5ml Sugar Syrup, 12.5ml Lemon Jucie, 25ml Passionfruit Puree",
                  method: "Shake all ingredients together and double strain into martini glass",
                  garnishGlass: "Shot of lemonade",
                  isMocktail: true
                },
                {
                  name: "Shrubble",
                  ingredients: "12.5ml Sugar Syrup, 25ml Lemon Juice, Top with Apple juice, Drizzle Grenadine",
                  method: "Add all ingredients to glass and stir, then add grenadine.",
                  garnishGlass: "Lemon Wedge",
                  isMocktail: true
                }
              ]}
            />
          </div>
        </>
      ),
    },
    {
      id: 'cleaning-the-beth-way',
      title: 'Cleaning The Beth Way',
      content: (
        <>
          <p>Cleanliness makes a venue. Who wants to be in dirty building let's be real.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Cleaning must do's</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Make sure to reach under the metal poles of the bar when sweeping</li>
            <li>Axe throwing area swept of astro dirt</li>
            <li>Mop buckets shouldn't be soapy or it dries wrong / with bubble marks</li>
            <li>Bleach should be used for mop behind bar to help with stickiness</li>
            <li>Glass cleaner used for balcony tables, fridges behind the bar and all screens</li>
            <li>Make sure to clean EVERYWHERE glasses may have been put (e.g. outside mens toilets)</li>
            <li>Beer pong tables need to be deep cleaned, if the spray doesn't work, use hot soapy water</li>
            <li>All metal counters behind the bar wiped down</li>
            <li>Pot wash area - pot wash drained and properly drained</li>
            <li>Glass collectors (baskets) put through the pot wash</li>
            <li>Cocktail spec sheets wiped down</li>
            <li>Dust TVs (screen and behind) just microfibre cloth</li>
            <li>Bottoms of the stalls wiped</li>
            <li>Leather sofas dusted and wiped down</li>
            <li>Perspex needs to be polished using microfibre cloth or soap and water</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Things Often Missed</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Bar Close</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Metal drip tray holders should, after remaining drip trays, be wiped</li>
                <li>Fruit put away in fridges</li>
                <li>Back bar countertop wiped</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Toilets</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Back boards of toilets needs wiping</li>
                <li>Toilets all flushed</li>
                <li>Hand towel bins emptied</li>
                <li>Refill toilet roll</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Ground Floor</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Darts area wiped down → with a microfibre cloth and water</li>
                <li>Axe throwing area - cages swept for astro dirt</li>
                <li>Karaoke room (mirrors etc)</li>
                <li>Sweeping (under table)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">1st Floor</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>All cushions from outside in kitchen</li>
                <li>Perspex countertops wiped for stickiness</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">2nd Floor (Golf)</h4>
              <p className="text-muted-foreground italic">(No specific items listed)</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">3rd Floor (Escape Rooms & Shooting Range)</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Clear BB's</li>
                <li>Reset escape rooms</li>
                <li>Hoover each room</li>
                <li>Wipe surfaces</li>
                <li>Clean office</li>
              </ul>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Ground Floor</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Check glasses on bar for dirt and put them through the pot-wash</li>
            <li>Set all the tables</li>
            <li>Wipe and dry surfaces</li>
            <li>Clean kegs on the Curling lanes</li>
            <li>Clean fake plants, inside and outside</li>
            <li>Hoover and clean golf grass</li>
            <li>Clean axe throwing cages</li>
            <li>Sweep up excess fake dirt from axe throwing lanes</li>
            <li>Sweep and mop an ice curling lane</li>
            <li>Clean disabled toilet</li>
            <li>Make sure all glasses are organised and easy to find</li>
            <li>Clean air hockey (Then use WD40 Dry PTFE and a microfibre cloth on the board)</li>
            <li>Bag Ice</li>
            <li>Clear stock room of boxes</li>
            <li>Move empty kegs to the front and organise full kegs coming from the wall</li>
            <li>Glass check ground and first floor</li>
            <li>Mop floor</li>
            <li>Polish glasses</li>
            <li>Wipe Fridges</li>
            <li>Refill Straws and Napkins</li>
            <li>Take bottles out of stock room and clean</li>
            <li>Empty bottle opener catcher</li>
            <li>Water axe throwing</li>
            <li>Clean axe throwing seats</li>
            <li>Toilets deep cleaned</li>
            <li>Wooden tables cleaned</li>
            <li>Organise back bar</li>
            <li>Clean/Bleach mop heads</li>
            <li>Sweep and organise the balcony</li>
            <li>Hoover and clean the stairwell</li>
            <li>Hoover and clean the ground floor staircase</li>
            <li>Get rubbish out of office</li>
          </ul>
          
          <p className="mt-6 italic text-spirits-cyan font-medium">"cleanliness is next to godliness"</p>
        </>
      ),
    },
    {
      id: 'the-host-tablet',
      title: 'The Host Tablet',
      content: (
        <>
          <p>Host tablets are used to see bookings, set up dart lanes, axe throwing lanes and our karaoke room. They are crucial to understand to achieve smooth service.</p>
        </>
      ),
    },
    {
      id: '501-darts',
      title: '501 Darts',
      content: (
        <>
          <p>Darts are our most popular activity. The set up is simple however that doesn't mean you can put someone on the lane and be done with it.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Start a lane</h3>
          <p>To start a dart lane you will need to open the 501 page on the Host Tablet. This will display your lanes available. Click on an available lane and then set how long they have, then confirm the booking. This will give you the code to activate the lane.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">The Code</h3>
          <p>Input the 3 digit code on the lane's tablet. From here you will ask "Have you ever used the 501 system before" whether they have or not, you will then show them how to set up their players and how to select a game.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Magnetise the Darts!</h3>
          <p>501 Darts tracking is all based on magnet. There is a small hole at the bottom right of each dart board, insert the sharp end of the dart in there, turning it for a few seconds and repeat until all the darts are working. If the customer comes back saying the darts are not tracking, do this step again or try unplugging the USB cable on the tablet and plugging it back in again.</p>
        </>
      ),
    },
    {
      id: 'ice-curling',
      title: 'Ice Curling',
      content: (
        <>
          <p>Ice Curling is one of our more unique activities. Few places in England have a form of Ice Curling, let alone our lanes have an Augmented Reality spin on the gamified sport.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Stones and all</h3>
          <p>To set up a lane is very simple. Get the bag of curling stones out, take each of the coloured stones out and have the blue stones on one side of the lane and the red stones on the opposite side.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Game-Modes</h3>
          <p>While you're showing them the lane, you will need to just show briefly how the app works. Show them the selections of game modes available and offer to explain further of a game they might like to try.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Maintenance</h3>
          <p>The stones will need to be lubricated from time to time. This is done with a microfibre cloth and DRY-PTFE WD40. Spray and wipe the liquid onto each of the ball bearings underneath the stones.</p>
          
          <div className="mt-4 p-4 bg-garrison-orange/10 border border-garrison-orange/30 rounded-lg">
            <p className="font-semibold text-garrison-orange mb-2">⚠️ DO NOT USE SILICONE:</p>
            <p className="text-muted-foreground">WD40 Silicone is used for waterproofing, rust protection and lubricating seals, not ballbearings. If used on the curling stones, they will not move as well, leave black grease marks on the lanes and result in a poor experience.</p>
          </div>
          
          <p className="mt-6 italic text-spirits-cyan font-medium">"you have a 2 minute window to solve a problem before a customer begins to be frustrated"</p>
        </>
      ),
    },
    {
      id: 'axe-throwing',
      title: 'Axe Throwing',
      content: (
        <>
          <p>Axe throwing requires more attention, the reason is self explanatory, these are real axes, treat them with care. Requires a good bit of introduction. Showing guests how to safely throw the axes and how to use our software.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Waiver!</h3>
          <p>Obviously, as we have real axes being thrown around we need guests to sign a waiver. This is very important. Online bookings will fill out an online version of the waiver so there is no need to redo it.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Start a session</h3>
          <p>To start an axe throwing lane, first you will need to select HyperAxe Lane Manager on the host tablet. You will see the available lanes, select one and set the amount of players and time the guests have, then press the play button.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">On the lane</h3>
          <p>Once you have the players on the lane, here is where your hosting skills come back into play.</p>
          
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
            <li>Start by asking the guests if they have tried axe throwing before, no matter the answer explain how to throw the axe.</li>
            <li>Tell them to put the axe in the allocated box between players rather than handing the axe between themselves (Eliminates risk).</li>
            <li>Start by showing the guest how to throw an axe safely and effectively and make sure they are understanding you as you do this.</li>
            <li>Then let the guests take it in turns, each throwing the axe continuously until they get it in the wood, once they have congratulate and move onto the next player.</li>
            <li>After everyone has achieved this, we then show the group how to use our software.</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">The software</h3>
          <p>To start you will get the players to enter their names onto the tablet in their lane. Then show the game mode options. Advice to start with classic, then select 5 rings and stationary. Show that players can sit out of a game by tapping their name, this will turn it red with a cross on the box. Then start the game for them. After this do regular checks on how they are doing and make sure they are not being dangerous with the axe.</p>
          
          <div className="mt-4 p-4 bg-garrison-orange/10 border border-garrison-orange/30 rounded-lg">
            <p className="font-semibold text-garrison-orange mb-2">⚠️ COLLECT THE AXE!</p>
            <p className="text-muted-foreground">After the guests are done, the axe must be collected, the axe must not be left unattended for obvious reasons.</p>
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Maintenance</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>The blocks must be wet before a booking, best to do this as you are opening the venue and just before you have a booking.</li>
            <li>If some of the blocks are worn out and breaking, replace them with new blocks that are kept nearby.</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">OPENING hyper-axe</h3>
          <p>To open the system in the morning can some times start with challenges if you don't know what you're doing. Here I'm going to go through some steps you can take to prevent any need of assistance.</p>
          
          <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">The micro-computer</h4>
          <p>To begin, open the cupboard between the two axe lanes, this will have two black micro-computers, one for each lane. Plugged into these two computers will be:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
            <li>1 AC Power cable,</li>
            <li>2 USB Type A cables and</li>
            <li>2 HDMI cables (One for the projector and one for the tablet).</li>
          </ul>
          <p className="mt-3">If they do not have these already plugged in, that's your first issue.</p>
          <p className="mt-3">Now we know the cables in place, time to turn the system on. You will need to press the red button on the front of the micro-computer, this is the power button believe it or not.</p>
          <p className="mt-3">While this is booting up, you need to turn the projectors on. Take the small black remote, surprisingly aim it at the wall the projector aims at and press the red power button, do this for each lane. Then use the arrows on the remote to highlight HDMI, then press OK, do this for both lanes.</p>
        </>
      ),
    },
    {
      id: 'karaoke-room',
      title: 'Karaoke Room',
      content: (
        <>
          <p>Our karaoke rooms are one of our top sellers — powered by Singa and perfect for boosting wet sales.</p>
          <p className="mt-3 italic text-spirits-cyan font-medium">Remember: Room service = revenue. The more you check in, the more they drink, the better the night.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Setting up the room</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>On the Host Tablet, open the Singa Dashboard tab.</li>
            <li>Find the correct room → tap the 3 dots under Actions.</li>
            <li>Select Activate.</li>
            <li>Set the booking duration → you're good to go.</li>
          </ol>
          <p className="mt-3 text-spirits-cyan font-medium">Pro Tip: Double-check the booking end time before starting the session</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Sound System Setup</h3>
          
          <div className="space-y-3">
            <div>
              <h4 className="text-lg font-semibold text-spirits-cyan mb-2">Microphone Volume</h4>
              <p className="text-muted-foreground">Extremely sensitive — turn up just a fraction.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-spirits-cyan mb-2">Music Volume</h4>
              <p className="text-muted-foreground">Set to around ⅔ of the slider for the best balance.</p>
            </div>
          </div>
          
          <p className="mt-3 text-muted-foreground">Test before guests arrive to ensure sound is clear and not distorted.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Be the "Host with the Most"</h3>
          <p className="text-muted-foreground">Karaoke NEEDS confidence. Confidence = drinks.</p>
          
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
            <li>Check in every 15-20 minutes.</li>
            <li>Offer top-ups and shots.</li>
            <li>Mention our drinks and shot deals.</li>
            <li>Keep the energy high and the smiles going.</li>
          </ul>
          
          <p className="mt-3 font-semibold text-spirits-cyan">Goal: Every check-in should aim to create another sale.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Maintenance & Hygiene</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Disinfect microphones between every booking.</li>
            <li>Wipe down tablet screens and surfaces.</li>
            <li>Report any equipment issues to management immediately.</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Bonus Steps</h3>
          <p className="text-muted-foreground">As of November 2025, Spirits now has two Karaoke Rooms. The newest being on the 2nd floor, comes in a few extra steps and few other problem solves that may happen.</p>
          
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-garrison-orange mb-2">No sound</h4>
              <p className="text-muted-foreground">There are 4 buttons on the back of the speaker in the cupboard under the tablet. Reach over and press your farthest right's button will switch from bluetooth to aux which will in turn play the audio.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-garrison-orange mb-2">Songs not loading</h4>
              <p className="text-muted-foreground">This is usually down to a connection to internet issue. This can happen if there has been drop outs in the venue or if someone has connected the tablet to a wifi of any kind. To fix, clear the entire queue on singa and skip to the next song so no track is loaded, then close the app and reopen it. If this does not fix the problem please report the issue to the manager on duty.</p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'footpool',
      title: 'Footpool',
      content: (
        <>
          <p>Footpool is another one of our unique experiences. It is very simple to set up, if you know how to set up a pool table, you are already halfway there! No tech, no fuss, footpool is a simple addition to our venue.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Rack 'em up!</h3>
          <p>To set up footpool you must first get the back of footballs out, put the white ball aside and then with the rest make the triangle in a pool formation. Then place the white ball on the opposite end for the guest. You will do the first set up and then the guests will take over the responsibility thereafter.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">The pack down</h3>
          <p>Really simple, collect the balls, place balls into the bag and put the bag away. Simples.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Maintenance</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>The balls must be kept clean, regular cleaning of the balls must take place in order to give the customers a richer experience.</li>
            <li>The amount of balls must be checked, there should be an even number of solids and stripes. This will not be a problem if you make sure to greet them at the end of their booking to pack down.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'shuffleboard',
      title: 'Shuffleboard',
      content: (
        <>
          <p>Shuffleboard is another simple one, no tech, just pucks and sand. Very few things can go wrong. Just keep the table tidy and well sanded and it will work.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Sand the table</h3>
          <p>Before a shuffleboard booking you must cover the table in sand or beeswax, depending on what we have in stock. This allows the pucks to glide along the table.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">The pucks</h3>
          <p>You must then give the players the pucks. 4 of each colour. Simple enough.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Explain the game</h3>
          <p>Once they have everything they need to play, explain how to play shuffleboard. Not everyone has played the game before and they might just think it sounds fun to try. So make sure they know what they are doing.</p>
          
          <div className="mt-4 p-4 bg-[oklch(0.14_0_0)] border border-border/30 rounded-lg">
            <h4 className="text-lg font-semibold text-spirits-cyan mb-3">How to play:</h4>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Each player takes turns to glide the pucks down the table from the same end, there are numbers 1, 2 and 3 at the end of the table.</li>
              <li>The pucks can be knocked out by other players or sometimes accidentally knocked into big points.</li>
              <li>Once all the pucks have been played, then the players add their final scores to see who wins.</li>
              <li>Then the players switch sides and play from the other end.</li>
            </ul>
          </div>
        </>
      ),
    },
    {
      id: 'beerpong',
      title: 'Beerpong',
      content: (
        <>
          <p>Beerpong, another simple one. The customers can have the choice of a jug of beer, a bottle of prosecco or a jug of a selected cocktail.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">The Red Cups</h3>
          <p>You then bring them 20 cups, 10 for each side and then set the cups up in rows of 4, 3, 2, 1 making a triangle shape pointing at each other on each end.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Clean down</h3>
          <p>Once the guest are done with beerpong, the is inevitably going to be a lot to clean down. Make sure the table is free from liquids and disinfected down until it is dry.</p>
        </>
      ),
    },
    {
      id: 'sharpshooters',
      title: 'Sharpshooters',
      content: (
        <>
          <p>Sharpshooters is our most unique experience at Spirits Bar & Games. It is an interactive shooting range with a plethora of game modes and air-soft imitation firearms. This activity requires more training than others.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">The BBs</h3>
          <p>Each of our guests receive 500 bullets with every booking. If we have 0.2g bullets in stock then you will be giving the customers 100g of bbs each.</p>
          <p className="mt-2 text-muted-foreground">If the weight of the Bbs are different to 0.2g, you can work out 500 bullets with this:</p>
          <p className="mt-2 text-spirits-cyan font-medium">500 × BB weight (in grams) = Total weight needed per guest</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Cataloging</h3>
          <p>Each of our guns have been catalogued (for example, AR-01 or SB-04), this helps for identifying issues that may arise with a particular gun.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Attack Sense software</h3>
          <p>At spirits we use a company called Attack Sense for our target systems. It is very simple to work with, not many bells and whistles.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">The Guns</h3>
          <p>Regarding the guns, we have a few types, mainly we stock AR types, these are fairly simple to handle.</p>
          <p className="mt-2 text-muted-foreground">From here I will explain each gun type we stock:</p>
          
          <div className="space-y-6 mt-4">
            <div>
              <h4 className="text-lg font-semibold text-spirits-cyan mb-3">AR Rifles</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>There is a switch on the left side of the gun with a little arrow that points to one of three fire types [Safe/Semi/Auto].</li>
                <li>On the right side of the gun there is a button above the magazine, this releases the mag from the gun and can be removed.</li>
                <li>Once removed pull back the slider on the top to reveal the fill hole. Here you will pour the bbs in until full.</li>
                <li>Insert the mag back into the gun by just pushing it into place.</li>
                <li>Then with the gun in a firing positions, wind the cog located at the bottom of the magazine (the cog can only rotate in one direction).</li>
                <li>You will do this until you here a secondary click with more resistance, this means the spring is full wound.</li>
              </ul>
              <p className="mt-3 text-muted-foreground">To insert a battery in the ARs is very simple. At the end of the stock is a cap, you removed the cap by squeezing the clips either side until it is released. Then take a battery, slide it down the inside of the stock with green end hanging out and clip the green ends together. Clip the cap back on and you're good to go.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-spirits-cyan mb-3">AK47 Rifles</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>With the AK47s, there is an arm on the right side of the gun, when it is at its highest, this is safety, in the middle it is semi auto and at the bottom it is full auto.</li>
                <li>To remove the magazine, there is a switch just at the top of the mag, push it towards the magazine to release it.</li>
                <li>Then follow the same process with the AR mags, flick open the bullet hole, and fill to the top.</li>
                <li>To insert the mag back in you have to go at an angle first and then click it into the switch. Then wind the gear.</li>
              </ul>
              <p className="mt-3 text-muted-foreground">To insert a battery in the AK47s is also quite simple. There is a button at the end of the top plate, press this and the top will come off. Take a battery and connect the green ends together and then clip the cap back on by pushing the non button hole end into the front and then clip the back on. Then you are good to go.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-spirits-cyan mb-3">Bolt Action Rifles</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>The bolt actions require a different process. There is a button underneath the gun, along the barrel, press this to release the made, you will see a circular hole, this is where the bbs will go.</li>
                <li>First you need to fill a bb syringe, then place the nozzle on the bullet hole, then push the syringe repeatedly until you can't anymore.</li>
                <li>Then insert the mag back into the gun by just pushing it back into the slot.</li>
                <li>Bolt actions are spring powered so they don't take a battery.</li>
                <li>Because of this, every shot requires you to pull the arm up, then back all the way, then forward, and then down again.</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-spirits-cyan mb-3">Green Gas Pistols</h4>
              <p className="text-muted-foreground">We have range of pistols we use at Sharpshooters. There are 2 types of pistols, green gas and co2. You can tell the difference between them by looking at the magazines. If the magazine has a input nozzle at the bottom then it is green gas, if there's a large silver canister throughout the magazine then it is co2.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-spirits-cyan mb-3">CO2 Pistols</h4>
              <p className="text-muted-foreground">CO2 pistols are a little more powerful than the green gas ones, however they come with their own little quirks that you have to be aware of.</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-garrison-orange/10 border-2 border-garrison-orange/50 rounded-lg">
            <h3 className="text-xl font-semibold text-garrison-orange mb-3">⚠️ IMPORTANT | SAFETY | FIRE RISK</h3>
            
            <h4 className="text-lg font-semibold text-garrison-orange mt-4 mb-2">LiPo (Gun Batteries) Important Notes</h4>
            <p className="text-muted-foreground mb-3">When charging LiPo Batteries it is important to note the following steps:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Do not let LiPo batteries go flat, once they are flat they will no longer hold a charge.</li>
              <li>Never leave LiPo batteries unattended during charging.</li>
              <li>If a battery becomes damaged or swollen do not attempt to use it again.</li>
              <li>Do not leave LiPo batteries in guns once you have finished Skirmishing as this can lead to the battery draining and becoming damaged.</li>
              <li>Only use LiPo rated chargers. NiMh chargers cannot detect when a LiPo is full and will overcharge them.</li>
            </ul>
            
            <h4 className="text-lg font-semibold text-garrison-orange mt-4 mb-2">General Safety</h4>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>When charging any battery it is important to charge it using only a charger designed for that type.</li>
              <li>Never leave a charging battery unattended.</li>
              <li>When charging the battery do so in a fire-safe environment.</li>
            </ul>
            
            <h4 className="text-lg font-semibold text-garrison-orange mt-4 mb-2">How do I know when my Battery is Flat?</h4>
            <p className="text-muted-foreground">When the battery in your gun is starting to die, it will begin to act sluggish. The weapon's trigger response will slow and the rate of fire will drop. The amount varies from gun to gun, but as soon as you start to notice this stop firing immediately and charge your battery.</p>
            <p className="mt-2 text-muted-foreground">If you have a LiPo battery you can also purchase a LiPo alarm separately, which can be plugged into the data cables of the battery and will provide a visual representation of if the battery is still good to use, and will let off a loud audible beep when the battery is too flat to use.</p>
            <p className="mt-3 text-sm text-muted-foreground/80">
              Reference: <a href="https://www.patrolbase.co.uk/featured-airsoft-news/airsoft-guides/airsoft-batteries-buying-guide" target="_blank" rel="noopener noreferrer" className="text-spirits-cyan hover:underline">Airsoft Batteries Buying Guide</a>
            </p>
          </div>
        </>
      ),
    },
    {
      id: 'escape-rooms',
      title: 'Escape Rooms',
      content: (
        <>
          <p>Escape rooms are an activity that also requires further training. Currently we have 3 rooms: Circus, Labyrinth and The Cabin. These scale in technology, Circus being the most primitive and The Cabin being the most advanced.</p>
          
          <p className="mt-4 text-muted-foreground">Being an escape room host isn't being an actor, you need confidence but you don't need to be over the top. Just relax and have a conversation with them, no one likes an awkward interaction.</p>
          
          <p className="mt-4 italic text-spirits-cyan font-medium">"A room is only as good as it's host."</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Resets</h3>
          <p>On a reset of a room, you have to put the room back to how it started. Getting the items and putting them back where they belong, locking the padlocks and shutting the doors. Some resets take more technical approaches but they are for the most part, straight forward.</p>
          
          <p className="mt-3 text-muted-foreground">Sometimes a group may have left the items in strange places, this is something you will get used to and will just have to do double checks and even triple checks to find them.</p>
          
          <p className="mt-3 text-muted-foreground">On the reset you will also want to look for damages. With these damages, more often than not, they are fixable by yourself with the help of an impact driver (drill). If there are any issues that require more than just a screw or a glue, make sure to report these issues into one of our group chats or contact your manager on shift to help deal with the problem immediately.</p>
          
          <p className="mt-3 italic text-spirits-cyan font-medium">Our rooms are sometimes in flux.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Hosting Pointers</h3>
          <div className="mt-4 p-4 bg-[oklch(0.14_0_0)] border border-border/30 rounded-lg space-y-3">
            <p className="text-muted-foreground italic">"Hi guys, how are you?"</p>
            <p className="text-muted-foreground italic">"If you want to hang your coats up or put bags away there are coat hangers just over there or I can take them into the office with me"</p>
            <p className="text-muted-foreground italic">"First of all, have you done an escape room before?"</p>
            <p className="text-muted-foreground italic mt-4">[Insert chatter]</p>
          </div>
        </>
      ),
    },
    {
      id: 'labyrinth',
      title: 'Labyrinth',
      content: (
        <>
          <p>Labyrinth is one of our tech based escape rooms. It requires the players to use their hands a little more than their brains. Themed off of a norse tomb, it is great for all ages as long as they are okay with a little darkness.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Hosting Pointers</h3>
          <div className="mt-4 p-4 bg-[oklch(0.14_0_0)] border border-border/30 rounded-lg space-y-3">
            <p className="text-muted-foreground italic">"Labyrinth is different from other escape rooms you may have done before. We based it off of the show Crystal Maze if you remember it. So it's less brain puzzles and more hands on and tactical."</p>
            <p className="text-muted-foreground italic">"It is pitch black in the Labyrinth so you will each get a head torch. You will need both your hands for this so you will want to put them on your heads."</p>
            <p className="text-muted-foreground italic">"We will turn them on just as you go in so I am not blinded by the lights" <span className="text-xs">(Joke like this usually works well)</span></p>
            <p className="text-muted-foreground italic mt-4">[Show them how the head torches work here]</p>
            <p className="text-muted-foreground italic">"With our escape rooms we like to make sure you finish and experience the whole room. We give unlimited clues so we provide you a radio to ask for anything you need."</p>
            <p className="text-muted-foreground italic">[Show them how the radio works here]</p>
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Safety Brief</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>It is dark</li>
            <li>No running</li>
            <li>There are no puzzles above head height so there is no need to pull on anything on the ceiling</li>
            <li>Usual escape rooms have padlocks however with Labyrinth, we use magnetic locks so when you solve a puzzle they will pop open and you will see they are open. If a door isn't opening, it means you haven't solved a puzzle yet, make sure you don't force them open.</li>
            <li>If your head torch stops working for any reason just give us a shout and I'll run a new one into you (however this shouldn't happen)</li>
            <li>Puzzles are puzzles not toys</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">The Story</h3>
          <p className="text-muted-foreground">You are group of intrepid explorers, off on an expedition to find the lost ruby in the Temple of the Great Chelmer. The builders of the temple made many cunning traps and puzzles to stop people from entering. Base camp have estimated you have just 1 hour before the structure collapses in on itself</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Time Frame</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Should be into the 2nd ring by 30 minutes</li>
            <li>Done with that ring in 20 minutes</li>
            <li>10 minutes for the last room</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">The reset</h3>
          <p>To start we will do what is a soft reset, this is everything back in its place without power. Follow this sheet until you turn the power on for the soft reset:</p>
          
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-spirits-cyan mb-2">Soft Reset (Power Off)</h4>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Power off the room via fuse board</li>
                <li>Ensure all four override switches are in the up position</li>
                <li>Open all doors (spear room doors are on bungees so won't stay open)</li>
                <li>Collect all game items:
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li>Ruby - from players on debrief</li>
                    <li>Temple exit ring - from the wall lock in temple</li>
                    <li>4 Staff parts - in alter in temple</li>
                    <li>Staff head - in alter in temple</li>
                    <li>Spears - from the spear room</li>
                    <li>Ping pong balls (air) - from ball detection machine, slide the bottom hatch to remove</li>
                    <li>Statues (earth) - from shelf unit on wall in earth</li>
                    <li>Amulet - from wall in skeleton room in the inner ring</li>
                    <li>Key - from players on debrief or still in the amulet lock</li>
                    <li>Blocks on temple floor - temple floor</li>
                  </ul>
                </li>
                <li>Replace items in correct positions:
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li>Ruby - box in temple wall</li>
                    <li>Temple exit ring - box in temple wall</li>
                    <li>4 staff parts - earth, air, fire, water</li>
                    <li>Staff head - randomly around game</li>
                    <li>Spears - randomly around game</li>
                    <li>Ping pong balls (air) - wind machine</li>
                    <li>Statues (earth) - in sand trough</li>
                    <li>Amulet - lock to chain in skeleton room</li>
                    <li>Key - on skeleton neck</li>
                  </ul>
                </li>
                <li>Undo jigsaw and pack away</li>
                <li>Spin 5 disc puzzle outside earth</li>
                <li>Mix up square puzzle outside fire</li>
                <li>Mix up discs outside air</li>
                <li>Mix up 3 laser puzzles</li>
                <li>Power on room (audio file may sound on boot up)</li>
              </ol>
              <div className="mt-3 p-3 bg-garrison-orange/10 border border-garrison-orange/30 rounded-lg">
                <p className="font-semibold text-garrison-orange">⚠️ Warning: all mag-locks are now energised. Do not get locked in!</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-spirits-cyan mb-2">Hard Reset (Power On)</h4>
              <p className="text-muted-foreground mb-2">Now you have the power on, this is considered a hard reset:</p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Reset disc puzzle outside air (N.B. hold reset button for two seconds)</li>
                <li>Reset air buttons puzzle on air control box.</li>
                <li>Reset air main control button on air control box</li>
                <li>Go to control room and reset temple</li>
                <li>Start from furthest point on outer ring. (Air side)</li>
                <li>Close doors at the furthest point</li>
              </ol>
            </div>
          </div>
          
          <p className="mt-6 text-muted-foreground">Now you know how to reset Labyrinth, use this guide whenever you feel like you are unsure. You don't want to realise you haven't done a set mid way through a booking.</p>
        </>
      ),
    },
    {
      id: 'circus',
      title: 'Circus',
      content: (
        <>
          <p>Circus is our more tradition styles of escape rooms, relying on a whole lot of padlocks and requiring out of the box thinking when it comes to numbers. Circus is more catered to your family days out. Great for children.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Hosting Pointers</h3>
          <div className="mt-4 p-4 bg-[oklch(0.14_0_0)] border border-border/30 rounded-lg space-y-3">
            <p className="text-muted-foreground">Circus is our more traditional escape room, there are a lot of padlocks so we would kindly ask you to hook them back on the latch you get them from once you have unlocked them.</p>
            <p className="text-muted-foreground">With our escape rooms we like to make sure you finish and experience the whole room. We give unlimited clues so we provide you a radio to ask for anything you need.</p>
            <p className="text-muted-foreground italic">[Show them how the radio works here]</p>
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Safety Brief</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>There are no puzzles above head height so there is no need to pull on anything on the ceiling.</li>
            <li>If your head torch stops working for any reason just give us a shout and I'll run a new one into you (however this shouldn't happen).</li>
            <li>Puzzles are puzzles not toys.</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">The Story</h3>
          <p className="text-muted-foreground">In 1876 a world renowned circus came to the outskirts of a small town. The main acts were Madame Malteva the fortune teller and the knife thrower. Madame Malteva fell madly in love with the knife thrower however he did not feel the same. Instead the knife thrower ran off with a girl from the town and got married. In a fit of rage Madame Malteva cursed the town and a person has gone missing every full moon since.</p>
          <p className="mt-3 text-muted-foreground">Now, in the present day, you have heard of this myth and have broken in to the now abandoned circus to see if there is any truth behind the fiction.</p>
          <p className="mt-3 text-muted-foreground">You will need to first let out the animals that have been left behind and then make your way to Madame Malteva's dressing room to find the knifes she stole to break the curse.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Time Frame</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Should be into the main room within 5 minutes</li>
            <li>Into the animal room within 20 minutes</li>
            <li>Into the dressing room within 20 minutes</li>
            <li>And out of the room within 15 minutes</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">END</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Go open the door for them</li>
            <li>Have a chat, tell them they did well at something you saw</li>
            <li>Little banter</li>
            <li>Give them their jackets and/or bags</li>
            <li>Write a play card out with their time and give them a flyer to come back again at a discounted price and talk about our other escape rooms and shooting range.</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">The reset</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Flick switch on fuze board that says Egypt.</li>
            <li>Click ball trap up.</li>
            <li>Collect all balls and put them back up top (make sure 4 numbered ones are in there).</li>
            <li>Fishing rod back on hook.</li>
            <li>Put ducks back flat and make sure they're pushed back.</li>
            <li>Find padlock for duck code entrance door and put on hook. Put stick on hook.</li>
            <li>Unchain the bear puzzle and put chains in pile at back of bear.</li>
            <li>Turn speak by popcorn machine off and on again.</li>
            <li>Put jack in a box back inside the crate and close and put latch back over.</li>
            <li>Close the last side show door (press red button to make magnetic locks work) (8) and put the footballs in between bears legs.</li>
            <li>Put the juggling balls under the third (0) side show door and lock the door (press red button to make magnetic locks work).</li>
            <li>Put the rings under second side show door (9) and lock the door (press red button to make magnetic locks work).</li>
            <li>Lock the first side show door (press red button to make magnetic locks work).</li>
            <li>Scatter the music sheet notes around the bear.</li>
            <li>Put Animals back inside animal cages.</li>
            <li>Put UV touch back inside knife thrower puzzle.</li>
            <li>Hide music key card in one of the cages.</li>
            <li>Lock up animal cages with the right padlocks.</li>
            <li>Wipe the whiteboard.</li>
            <li>Tuck lions tail back in front of lion.</li>
            <li>Tidy animal room.</li>
            <li>Find Side show padlock and lock the door.</li>
            <li>Find Score padlock and lock the door.</li>
            <li>Find clown padlock and lock the door.</li>
            <li>Find grizzly padlock and lock the door.</li>
            <li>Make sure table and chair in right place.</li>
            <li>Put magic mirror cube back into wireless charger.</li>
            <li>Make sure 'my reading' chest has small box with padlock on it.</li>
            <li>Make sure smells and written potions is back in medium chest then lock with right lock.</li>
            <li>Close big chest and lock the right locks.</li>
            <li>Bag up the diamonds and put them under the hat.</li>
            <li>Put crystal ball back.</li>
            <li>Put draping back down.</li>
            <li>Switch plug off next to large box for 3 seconds then turn back on to reset.</li>
            <li>Come out of the room and put the right padlock on the corresponding locks and lock the door.</li>
            <li>Leave the room and lock the duck padlock behind you.</li>
          </ol>
          <p className="mt-4 font-semibold text-spirits-cyan">Your room is ready.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Codes</h3>
          <div className="mt-4 p-4 bg-[oklch(0.14_0_0)] border border-border/30 rounded-lg">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="font-medium text-foreground">Duck door</span> - 2489 (Plain padlock)</li>
              <li><span className="font-medium text-foreground">Side Show</span> - 1908 (Gold spot)</li>
              <li><span className="font-medium text-foreground">Score</span> - 4414 (Blue spot)</li>
              <li><span className="font-medium text-foreground">Clown</span> - R8G15B7 (Dark purple spot)</li>
              <li><span className="font-medium text-foreground">Grizzly</span> - R18Y3B4 (Lighter Orange)</li>
              <li><span className="font-medium text-foreground">Lion Cage</span> - 4500 (Dark Yellow spot)</li>
              <li><span className="font-medium text-foreground">Rhino Cage</span> - 1800 (White spot)</li>
              <li><span className="font-medium text-foreground">Elephant Cage</span> - 2800 (Light Pink spot)</li>
              <li><span className="font-medium text-foreground">Panda Cage</span> - 3900 (Sparkle spot)</li>
              <li><span className="font-medium text-foreground">Cages</span> - 3514 (Light Yellow spot)</li>
              <li><span className="font-medium text-foreground">Balloons</span> - 1428 (Dark Green spot)</li>
              <li><span className="font-medium text-foreground">My Love</span> - 9647 (Bright pink spot)</li>
              <li><span className="font-medium text-foreground">YBGR</span> - 2876 (Lavender spot)</li>
              <li><span className="font-medium text-foreground">Magic Cube</span> - 273 (Plain padlock)</li>
              <li><span className="font-medium text-foreground">NESW Tarots</span> - 2946 (Dark Purple spot)</li>
              <li><span className="font-medium text-foreground">Love Potion</span> - 5378 (Tango Orange spot)</li>
              <li><span className="font-medium text-foreground">Diamond code</span> - R2B1G2Y4 (Plain padlock)</li>
              <li><span className="font-medium text-foreground">Tarot cards</span> - death, fool, judgement, lovers.</li>
              <li className="ml-4 text-xs">Card locations: door edge of coconut shy, where balls drop out, next to bear paw print, top of chest.</li>
            </ul>
            
            <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Smells:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>Pineapple - 1</li>
              <li>Jasmine - 2</li>
              <li>Strawberry - 3</li>
              <li>Jujube - 4</li>
              <li>Honey - 5</li>
              <li>Apple - 6</li>
              <li>Grape - 7</li>
              <li>Peach - 8</li>
              <li>Wheat - 9</li>
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">If these run out or don't smells as strong then refill them or make new bottle with a number</p>
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Walkthrough</h3>
          <div className="space-y-6 mt-4">
            <div>
              <h4 className="text-lg font-semibold text-spirits-cyan mb-2">Corridor Room:</h4>
              <p className="text-muted-foreground mb-2">So you enter a small corridor with a locked door at the end. To the right of you is a caged compartment with 4 large ducks inside and a spinning light at the end (for a much later puzzle). On the opposite wall hangs a large stick with a hook on the end.</p>
              <div className="mt-2 p-3 bg-[oklch(0.12_0_0)] rounded border border-border/20">
                <p className="font-medium text-foreground mb-1">Puzzle 1: Hook A Duck (2489)</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Pick up the large stick hanging on the wall</li>
                  <li>Use it through the bars to Hook A Duck and flip it over</li>
                  <li>Each of the 4 ducks has a number on the bottom: 2, 8, 9 & 4</li>
                  <li>On the door states "Rising High", implying the code is ascending in numerical order</li>
                  <li>Meaning the order of the code is 2489</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-spirits-cyan mb-2">Main Room:</h4>
              <p className="text-muted-foreground mb-2">You will now enter the main room of the circus. In the middle is a giant bear, on the back wall is a series of side show games, to the right is a door leading to the "Animal Room" and on the left is a door leading to "Madame Malteva's Dressing Room". You will have to enter the Animal Room first.</p>
              
              <div className="mt-3 space-y-3">
                <div className="p-3 bg-[oklch(0.12_0_0)] rounded border border-border/20">
                  <p className="font-medium text-foreground mb-1">Puzzle 2: Side Show (1908)</p>
                  <p className="text-sm text-muted-foreground mb-2">Going from right to left you will see a basketball style game, "Don't lose your head" game, a coconut shy & and a hoop game.</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>First, throw the balls into the buckets. This door is already open, inside is 1 number. CODE 1923</li>
                    <li>Next look through at the masks in the 'don't loose your head'. Pick up the stick and move the masks aside to fine 4 numbers. On the teeth of the masks there is '1234' one of each will be circled on each mask. This is the order of the numbers for the padlock. This will open the door underneath giving you some juggling balls</li>
                    <li>Now use the juggling balls to knock the cups down from their stands. The cups are coloured. Once the cups are knocked down you will notice numbers are written inside some of them. The numbers on the side of the cups will then read each colour corresponding to colour coded padlock: 8, 4, 5, 3. This will open the door underneath and reveal a set of hoops</li>
                    <li>Now, finally get the hoops from the newly opened door and hook them over the posts. The posts will knock down revealing numbers on the back, on the top of them you'll see '123' this is the order of the numbers for the 3 digit padlock. CODE 248</li>
                    <li>Inside this door you'll find music sheets.</li>
                    <li>Now you have all the small doors unlocked, open them up to reveal a number on each door. The code will read 1908 which is your code to unlock the side show padlock.</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-[oklch(0.12_0_0)] rounded border border-border/20">
                  <p className="font-medium text-foreground mb-1">Puzzle 3: Score (4414)</p>
                  <p className="text-sm text-muted-foreground">There are many sheets in the stack but the one you will need is "Animals at the Circus". The first two lines read: "The animals came in 2X2 Hurrah! Hurrah! The animals came in 2X2, The Elephants and 1 KANGAROO. And they all went into the ark, Four to get out of the rain." Now, 2X2 = 4, A Kangaroo = 1, Four... So the code will be 4414</p>
                </div>
                
                <div className="p-3 bg-[oklch(0.12_0_0)] rounded border border-border/20">
                  <p className="font-medium text-foreground mb-1">Puzzle 4: Clown (8157)</p>
                  <p className="text-sm text-muted-foreground">In the main circus room is a box labeled "Clown Toy Box". Once opened, a large multicoloured tube will pop out like a jack in the box. On it will be numbers written on different colours. If you look back to the padlock on the Animal Room door labeled "Clown" you will notice it is coloured. So to figure this puzzle you will need to find the numbers on the tube corresponding with the colours on the padlock: Red - 8, Green - 1, Yellow - 5, Blue - 7. So the code is 8157</p>
                </div>
                
                <div className="p-3 bg-[oklch(0.12_0_0)] rounded border border-border/20">
                  <p className="font-medium text-foreground mb-1">Puzzle 5: Grizzly (1834)</p>
                  <p className="text-sm text-muted-foreground">Grizzly relates to the large stuffed bear in the main room and the chains hanging from the walls. The hooks that the chains hang from are different colours and each one has a number next to it. For each colour there is only one chain that will reach the hook on the back of the bear's neck. Once all hooked up you shall see: Red chain - 1, Green chain - 8, Yellow chain - 3, Blue chain - 4. So the code is 1834</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-spirits-cyan mb-2">Animal Room:</h4>
              <div className="mt-3 space-y-3">
                <div className="p-3 bg-[oklch(0.12_0_0)] rounded border border-border/20">
                  <p className="font-medium text-foreground mb-1">Puzzle 6: Feeding Time</p>
                  <p className="text-sm text-muted-foreground mb-2">Behind the door you have just opened is a list of what all the animals eat:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                    <li>Lion = 2 steaks + an apple + a fish → 4500g</li>
                    <li>Rhino = 3 bananas + 3 apple → 1800g</li>
                    <li>Elephant = 5 bananas + 4 apples → 2800g</li>
                    <li>Panda = 3 fish + 3 apples → 3900g</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">Weights: Apple = 200g, Banana = 400g, Fish = 1100g, Steak = 1600g. To work this out you may need the whiteboard supplied to you in the room.</p>
                </div>
                
                <div className="p-3 bg-[oklch(0.12_0_0)] rounded border border-border/20">
                  <p className="font-medium text-foreground mb-1">Puzzle 7: Cages (3514)</p>
                  <p className="text-sm text-muted-foreground">Now, collected the animals out of their cages and take them over to the paw print with the plaque of animals just outside the Animal Room. If you place the animals on the paw print a number will flash up next to it: The Elephant will flash 3, The Panda will flash 5, The Lion will flash 1, And the Rhino will flash 4. The plaque shows the order they need to be read in so the code will be 3514</p>
                </div>
                
                <div className="p-3 bg-[oklch(0.12_0_0)] rounded border border-border/20">
                  <p className="font-medium text-foreground mb-1">Puzzle 7: My Love (9647)</p>
                  <p className="text-sm text-muted-foreground">My love box now has a 4 digit padlock on it. To find the code you have to look underneath the poster to see 3 tarot cards '10 of knives, 7 of knives, 3 of knives' (1073). You will need to enter that code on the padlock on the box labeled "The Amazing Knife Thrower" (Madame Malteva's Love). Once the box is open, it will give you the code 9647 and a UV torch</p>
                </div>
                
                <div className="p-3 bg-[oklch(0.12_0_0)] rounded border border-border/20">
                  <p className="font-medium text-foreground mb-1">Puzzle 8: Balloons (1428)</p>
                  <p className="text-sm text-muted-foreground">Using the UV torch, find the 4 clown portraits. Each will have a number on the balloons. Locations: In the popcorn machine: 4, Behind the basketball game door: 2, On the ceiling in the corridor: 1, One deep in the Elephant cage: 8. The number of balloons is the order they have to be placed in. Giving you: 1428</p>
                </div>
                
                <div className="p-3 bg-[oklch(0.12_0_0)] rounded border border-border/20">
                  <p className="font-medium text-foreground mb-1">Puzzle 9: YGBR (2876)</p>
                  <p className="text-sm text-muted-foreground">Going back into the Animal Room, below the Lion's cage, is written "Pull My Tail". Hanging from the Lion is a rope (it's tail). If you go back to the beginning, where the ducks are, you will see a wheel at the end with a static yellow light and a rotating blue light. One of you will have to stay there and another will need to go and pull the tail at the right time. You need the blue light to land on the yellow light. Once that happens balls will drop from the ceiling, some of which will have numbers on them. A yellow ball, a green ball, a blue ball and a red ball (or YGBR). You will get the code 2876. You will then put the numbers in this order and open the final lock to Madame Malteva's dressing room.</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-spirits-cyan mb-2">Madame Malteva's Dressing Room:</h4>
              <p className="text-muted-foreground mb-3">Upon entering the dressing room you'll see walls plastered with tarot cards, a table in the centre of the room with 4 tarot cards and a crystal ball. On the back wall are 3 locked chests and a Magic Cube on the far right. On the table will be a book explaining the 5 steps to break her curse.</p>
              
              <div className="mt-3 space-y-3">
                <div className="p-3 bg-[oklch(0.12_0_0)] rounded border border-border/20">
                  <p className="font-medium text-foreground mb-1">Puzzle 10: Magic Cube (273)</p>
                  <p className="text-sm text-muted-foreground">First, pick up the cube and you will start to hear noises emitting from it when it is flipped over in different directions. There are good and bad "beeps" you will want to follow the good beeps. You will want to flip it onto it's top with the "B" facing up and looking at you, then right, right & back. Then the screen will light up the code 273. This will open the 3 digit locked box in the chest to the left</p>
                </div>
                
                <div className="p-3 bg-[oklch(0.12_0_0)] rounded border border-border/20">
                  <p className="font-medium text-foreground mb-1">Puzzle 11: NESW (2946)</p>
                  <p className="text-sm text-muted-foreground">Inside the box says NESW, relating to North, East, South, West. Looking back on the table behind you, you will see 4 tarot cards: The 2 of swords at the top, The 9 of coins on the right, The 4 of wands at the bottom, The 6 of cups on the left. Following the NESW clue you will get 2946. This will open the chest on the left</p>
                </div>
                
                <div className="p-3 bg-[oklch(0.12_0_0)] rounded border border-border/20">
                  <p className="font-medium text-foreground mb-1">Puzzle 12: Love Potion (5378)</p>
                  <p className="text-sm text-muted-foreground">Inside this box you will find jars with numbers on them and they smell of different things. On the wall above, a love potion is written: "A hint of honey to keep him sweet, Next, some strawberries for a sweet treat, One grape is next, and then to complete the potion... Some peach to get the love in motion". Using your nose you will have to smell out these 4 scents: Honey is 5, Strawberry is 3, Grape is 7, Peach is 8. This gives us 5378 which will open one of the padlocks on the final chest</p>
                </div>
                
                <div className="p-3 bg-[oklch(0.12_0_0)] rounded border border-border/20">
                  <p className="font-medium text-foreground mb-1">Puzzle 13: Crystals (2154)</p>
                  <p className="text-sm text-muted-foreground">Somewhere in the room (Usually under the hat) are a set of small bags with different coloured Crystals inside, 2 Red, 1 Blue, 2 Green and 4 Yellow. All you have to do is count how many of each colour and then put that number into the corresponding colour on the padlock.</p>
                </div>
                
                <div className="p-3 bg-[oklch(0.12_0_0)] rounded border border-border/20">
                  <p className="font-medium text-foreground mb-1">Puzzle 14: Tarot Card</p>
                  <p className="text-sm text-muted-foreground">In the, now opened, chest there will be a wooden box with The Fool tarot card on the top. Do not pick up this box! The Fool is one of 4 tarot cards dotted about in the circus other than the ones on Madame Malteva's shelf: The Lovers, Judgment, Death. You will need to place a hand on each of the copies on Madame Malteva's shelf at the same time and her curse will be broken. The box will open revealing the knife thrower's knives. Collect these and you have... ESCAPED!</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'the-cabin',
      title: 'The Cabin',
      content: (
        <>
          <p>The Cabin is our newest and most technologically advanced room to date. It is part escape room, part horror experience. To make this possible we use the Cogs software by Clockwork Dog.</p>
          
          <p className="mt-3 text-muted-foreground">The Cabin requires no radio, instead we can use Cogs text hints feature and type out the clues and display them on the screen. For anything important such as someone is about to break something, we have a tannoy system in place, press and hold the talk button to speak through the sound system in the room.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Hosting Pointers</h3>
          <p className="text-muted-foreground">The Cabin has been made to relieve the hosting pressure a little of the staff with the addition of an introductory video. This video explains the rules and the story for you. However this does not mean it all is self sufficient, once again an escape room is only as good as it's host.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Cogs software</h3>
          <p className="text-muted-foreground">Cogs is an escape room software that allows us to use a wide range of electronics all running off one system. When you open Cogs, we have set it up to open The Cabin's file. From here you just need to select the RUN tab.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">The reset</h3>
          <p className="text-muted-foreground">The Cabin's reset is a simple process, you are playing the game in reverse. Putting the items back when the players found them and shutting the doors that have opened.</p>
          
          <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">In cogs</h4>
          <p className="text-muted-foreground mb-2">So you have just finished running The Cabin, first things first, you want to click Cancel at the top of the cogs page, it will ask you if you want to cancel again so click yes, then Reset, and then Pre-Show (This will open the doors and turn on all the lights).</p>
          <div className="mt-3 p-3 bg-garrison-orange/10 border border-garrison-orange/30 rounded-lg">
            <p className="font-semibold text-garrison-orange">⚠️ Warning: all maglocks are now energised. Do not get locked in!</p>
          </div>
          <p className="mt-3 text-muted-foreground">You will want to leave the Air Compressor on for this as you don't want the doors to shut on your while you're in there as in pre-show the doors are now active.</p>
          
          <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">The room</h4>
          <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
            <li>
              Start by finding Elias' blood bottle and the Final Moments page, wrap the page around the blood bottle and put it into the left chest on top of the fireplace. You will get the word padlock next to the box that should say Decay. Lock the box with this padlock with the letters facing you so it is readable.
              <p className="mt-1 text-sm">To check what blood vial is who's, use a UV torch to reveal the label, these are located in the host office.</p>
            </li>
            <li>Collect the other blood bottles and place then back on the shelves in the Witch's Room.</li>
            <li>
              Then collect the ouija bag and hook it on the Ouija board in the Witch's Room.
              <p className="mt-1 text-sm">As long as there is no items left in the Catacombs and the TV is on set to the right HDMI, this room is now finished and you can close the door on your way out. Make sure it catches and you cannot open this any more.</p>
            </li>
            <li>
              Now, in the Witch's Room, collect the 6 Devil Cards and place them around The Cabin. Make sure you place some in the skull cupboard underneath the projector in the Film Room.
            </li>
            <li>
              Now the devil cards are dealt with, we will now collect all the puzzle pieces. These can be placed around the room however you see fit as long as some of them are also in the skull cupboard under the projector and they are not placed in the Witch's Room (As they will not be able to access this without the completed puzzle).
              <div className="mt-2 p-2 bg-[oklch(0.12_0_0)] rounded border border-border/20">
                <p className="text-sm font-medium text-foreground mb-1">Light Channel Issue:</p>
                <p className="text-sm">Sometimes, the lights in the cabin can get confused what channel they are on. The main problem at the time of writing this is in the Witch's Room, on the right of the alter. This has been labeled with a number of (29). On the light, you will need to click the mode button until you see a lower case "d" and then you need to set the number to "29" with the arrow buttons. It should end up displaying "d029"</p>
              </div>
            </li>
            <li>Now we go into the projector room, collect the drawers of body parts and slot them back in the shelf on the left as you walk in the room. Then make sure the fan is on next to that.</li>
            <li>Now close the skull cupboard, making sure it sticks. Then lock the box just outside the room with the code 273. Make sure you lock the padlock with the numbers facing you once again.</li>
            <li>
              Now make your way to the end of the corridor, lifting up the puzzle hatch until it locks in place via the magnets. Lift the hatch from the bottom and slide it up carefully with a little force to avoid any damages.
            </li>
            <li>
              Make your way into the living room and close the bookshelf. This can be a little tricky sometimes to get the maglock to catch. Keep trying to shut it with the metal pieces aligning. When you cannot pull it open it is then locked.
              <div className="mt-2 p-2 bg-garrison-orange/10 border border-garrison-orange/30 rounded">
                <p className="text-sm font-semibold text-garrison-orange">⚠️ This step is so crucial, if the bookshelf isn't locked properly it will ruin the whole session! Close the bookshelf!</p>
              </div>
            </li>
            <li>Now push the books back into place. This may require some manoeuvring as some of the books can open, make sure to take care as to not damage them.</li>
            <li>
              Now take the page titled My dearest, you will see it has the book titles in the 3rd paragraph, roll it up and place it into the right chest on the fireplace. Take the word padlock next to the box that should say Curse. Lock the box with this padlock with the letters facing you so it is readable.
            </li>
            <li>
              Now take the morse code page, this will have big bold lines and letters printed on it, place this in the left hand hole of the cupboard next to the bookshelf.
              <p className="mt-1 text-sm">If this has been locked, you will need to go back to Cogs, click on the overrides tab, find the JUMP SCARE BOX LOCK tab and power it, this will release the latch and push the doors back open.</p>
              <p className="mt-1 text-sm">Once the page are in the cupboard you can shut it, first shut the right side and then the left.</p>
              <div className="mt-2 p-2 bg-[oklch(0.12_0_0)] rounded border border-border/20">
                <p className="text-sm font-medium text-foreground mb-1">Common Problem:</p>
                <p className="text-sm">A common problem that happens in this puzzle is that the morse code page is missing. For the page, there is a small gap at the back of the box in the hole. If a customers has pushed the page right back it can fall down, meaning we have to take the cupboard out and remove the back panel with a impact driver and you'll find the page at the bottom.</p>
              </div>
            </li>
            <li>Clear the chalkboard off from the previous booking and make sure there is still enough chalk for the next group. Then place them both on the barrel with the radio.</li>
            <li>Now collect the fuses from the fuse board and any spares left out and place them around the living room. Ideally place some on in the bookshelf, some on the fireplace and some on the barrel. Then close the fuse board.</li>
            <li>Leave the living room into the forest. Close the door behind you, checking the maglock has fully connected and cannot be opened.</li>
            <li>Get a step ladder and put the first two sigils hanging from the ceiling up onto their maglocks. Both of these have metal washers on them to connect to these magnets.</li>
            <li>Turn the lamp on for the customers and place it under the tree.</li>
          </ol>
          
          <p className="mt-6 font-semibold text-spirits-cyan">You have now reset the cabin</p>
        </>
      ),
    },
    {
      id: 'swing-city',
      title: 'Swing City',
      content: (
        <>
          <p>Swing City is our brand new concept, using the latest tech to bring a different kind of golf. To run this it's simple, you will just need to know a few troubleshooting techniques and be a helping hand to the customers.</p>
          
          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">THE START THE TECH</h3>
          
          <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">The fuses</h4>
          <p className="text-muted-foreground mb-2">Back by popular demand.</p>
          <p className="text-muted-foreground">In the morning you will need to turn on all the fuses on the fuse board. Located on the top left of the stock room door.</p>
          
          <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Host station</h4>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Power on MacBook (Password is 0000)</li>
            <li>On the desktop you should see 3 applications with arrows pointing to them named (1, 2, 3), this is the order you open them in.</li>
            <li>The first of which starts all its processes itself</li>
            <li>The second (COGS) will need you to click "RUN".</li>
            <li>The third application is your host screen.</li>
          </ol>
          
          <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Tablets</h4>
          <p className="text-muted-foreground mb-2">Unlock a tablet</p>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Open Tailscale.</li>
            <li>Open SwingCity.</li>
            <li>Select Hole on the Swing City app.</li>
            <li>Repeat this step for all the tablets.</li>
          </ol>
          
          <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Set up a game</h4>
          <p className="text-muted-foreground">All the training for the Swing City is provided on the Swing City Admin website. You will need a 4 digit log in code which will be the same as your Square login.</p>
          <p className="mt-3">
            <a 
              href="https://www.swingcityadmin.co.uk/training" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-spirits-cyan hover:underline font-medium"
            >
              www.swingcityadmin.co.uk/training
            </a>
          </p>
        </>
      ),
        },
      ],
    },
    {
      id: 'the-safety-bit',
      title: 'The Safety Bit',
      sections: [
        {
          id: 'safety-intro',
          title: 'The Safety Bit',
          content: (
            <>
              <p>No matter what company you work for, whether that's hospitality, office work or labouring, you always need to know how to keep yourself and others safe.</p>
              
              <p className="mt-4">This section of the book will cover:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li>Allergy Awareness</li>
                <li>COSHH</li>
                <li>HACCP</li>
                <li>Manual Handling</li>
                <li>Conflict Management</li>
                <li>Fire Safety</li>
              </ul>
              
              <p className="mt-4">These are fundamental topics that you as staff will need to know to help us keep the venue safe from hazards and keeping our guests the happiest they can be.</p>
              
              <p className="mt-4">These topics will need to be studied and the management team will test you on them. Once you feel competent in your understanding, you will need to receive a signature from your management. If they feel as if you comprehend the subject, then they will sign off at the end of this chapter.</p>
            </>
          ),
        },
        {
          id: 'allergy-awareness',
          title: 'ALLERGY AWARENESS',
          content: (
            <>
              <p>Food allergens are substances in food that trigger abnormal immune responses in some people. This reaction can range from mild discomfort to life-threatening anaphylaxis. As staff in a hospitality setting, you play a crucial role in ensuring the safety and well-being of guests with allergies.</p>
              
              <p className="mt-4">This training document will help you:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li>Understand common allergens.</li>
                <li>Identify sources of allergens.</li>
                <li>Practice effective food handling to prevent cross-contamination.</li>
                <li>Communicate with guests effectively about allergens.</li>
              </ul>
              
              <div className="mt-4 p-4 bg-garrison-orange/10 border border-garrison-orange/30 rounded-lg">
                <p className="font-semibold text-garrison-orange">⚠️ Remember: A single mistake could be life-threatening for an allergic guest. Diligence, accuracy, and clear communication are essential.</p>
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">1. Recognising Common Food Allergens</h3>
              <p className="text-muted-foreground">The most common allergens (often called the "Big 14" in the EU) include:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li>Peanuts</li>
                <li>Tree nuts (such as almonds, hazelnuts, and cashews)</li>
                <li>Milk</li>
                <li>Eggs</li>
                <li>Fish</li>
                <li>Shellfish (such as shrimp, crab, and lobster)</li>
                <li>Wheat (gluten)</li>
                <li>Soy</li>
                <li>Sesame seeds</li>
                <li>Lupin</li>
                <li>Mustard</li>
                <li>Celery</li>
                <li>Sulphur dioxide and sulphites (in high concentrations, usually in wine and dried fruits)</li>
                <li>Molluscs (like mussels, snails, and squid)</li>
              </ul>
              <p className="mt-3 text-muted-foreground">All staff should know which dishes contain these allergens or might contain traces due to cross-contact. Always consult ingredient lists and allergen information for each menu item.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2. Sources of Allergen Contamination and Cross-Contact</h3>
              <p className="text-muted-foreground">Cross-contact occurs when allergens are unintentionally transferred from one food or surface to another. This can happen via:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li>Shared kitchen equipment (e.g., knives, cutting boards, frying pans)</li>
                <li>Oil or water used for cooking different items</li>
                <li>Hands or gloves that have touched allergenic foods</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">How to Minimise Cross-Contact:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Always use separate or thoroughly cleaned utensils, cookware, and serving dishes for allergen-free requests.</li>
                <li>Keep allergen-free foods physically separate from other foods, particularly during preparation and plating.</li>
                <li>Regularly clean and sanitize all work surfaces, cutting boards, utensils, and equipment.</li>
                <li>Store ingredients carefully, especially allergens, to avoid contamination with allergen-free ingredients.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3. Best Practices for Food Handling and Preparation</h3>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Receiving and Storing Ingredients</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Ensure suppliers label ingredients with clear allergen information.</li>
                <li>Store allergenic foods in sealed containers and away from non-allergenic foods.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Preparing Food</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Use designated allergen-free areas and equipment if possible.</li>
                <li>Change gloves and wash hands thoroughly when handling allergenic ingredients.</li>
                <li>Use colour-coded equipment (e.g., red for allergenic foods) to help prevent cross-contact.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Serving Food</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Present allergen-free dishes with clear separation from allergenic dishes.</li>
                <li>Use separate trays and serving utensils for allergen-free dishes.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">4. Effective Communication with Guests</h3>
              <p className="text-muted-foreground">Clear and effective communication about allergens is essential. Follow these guidelines:</p>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Taking Orders</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Politely ask all guests if they have any allergies. Don't assume that guests will always inform you.</li>
                <li>When a guest mentions an allergy, listen carefully and take detailed notes.</li>
                <li>Confirm allergen information with the chef or kitchen staff and let the guest know how you will handle their food to avoid allergens.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Communicating Dish Information</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Be honest and transparent. If you're unsure whether a dish contains an allergen, don't guess—confirm with the kitchen.</li>
                <li>Let guests know of any potential cross-contact risks.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Confirming Allergen-Free Requests</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Double-check with kitchen staff that allergen-free orders are correctly prepared.</li>
                <li>Inform the guest that their order has been prepared with allergen safety in mind.</li>
                <li>If a dish cannot be prepared without a certain allergen, communicate this clearly and suggest alternative options.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">5. Emergency Response for Allergic Reactions</h3>
              <p className="text-muted-foreground">If a guest shows signs of an allergic reaction, they may experience symptoms such as:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li>Swelling of the face, lips, tongue, or throat</li>
                <li>Difficulty breathing</li>
                <li>Hives or rash</li>
                <li>Stomach cramps, vomiting, or diarrhoea</li>
                <li>Dizziness or loss of consciousness</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Steps to Follow:</h4>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li><span className="font-medium text-foreground">Stay Calm and Alert:</span> Quickly identify the signs and symptoms of an allergic reaction.</li>
                <li><span className="font-medium text-foreground">Call for Help:</span> Immediately call for emergency medical services and notify a manager.</li>
                <li><span className="font-medium text-foreground">Assist with EpiPen:</span> If the guest has an epinephrine auto-injector (like an EpiPen), offer to assist them in using it if they're unable to do so.</li>
                <li><span className="font-medium text-foreground">Monitor the Guest:</span> Stay with the guest until medical professionals arrive.</li>
              </ol>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">6. Reviewing and Updating Allergen Procedures</h3>
              <p className="text-muted-foreground">To maintain a safe environment:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li>Regularly update allergen procedures and conduct refresher training for all staff.</li>
                <li>Ensure that new menu items are reviewed for allergen information and marked appropriately.</li>
                <li>Monitor ingredient labels and supplier changes for potential allergen issues.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">7. Staff Responsibilities and Accountability</h3>
              <p className="text-muted-foreground">Remember: Each staff member plays an essential role in ensuring allergen safety. Everyone, from waitstaff to kitchen staff, needs to take allergens seriously and follow procedures meticulously. Mistakes can be costly, not only for the guest's health but also for the venue's reputation.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Conclusion</h3>
              <p className="text-muted-foreground">Allergen awareness and food safety protocols protect guests and staff alike. By following these guidelines, you help create a safe, inclusive dining experience for everyone. Let's work together to ensure our venue is allergen-aware and responsible in all its service practices.</p>
            </>
          ),
        },
        {
          id: 'coshh',
          title: 'COSHH',
          content: (
            <>
              <p>The Control of Substances Hazardous to Health (COSHH) regulations are designed to protect employees from health risks arising from exposure to hazardous substances. In a hospitality setting, these substances can include cleaning chemicals, kitchen sanitisers, and other maintenance products.</p>
              
              <p className="mt-4">This training will help staff understand:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li>What COSHH is and why it's important.</li>
                <li>How to identify hazardous substances.</li>
                <li>Safe handling, storage, and disposal of hazardous substances.</li>
                <li>Procedures for dealing with spills and exposure.</li>
                <li>First aid measures for COSHH-related incidents.</li>
              </ul>
              
              <p className="mt-4 font-semibold text-spirits-cyan">Your health and safety, as well as that of your colleagues and guests, depend on adherence to these guidelines.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">1. Understanding Hazardous Substances in Hospitality</h3>
              <p className="text-muted-foreground">Hazardous substances are any materials that could cause harm if they come into contact with skin, are inhaled, or are ingested. Common hazardous substances in hospitality venues include:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li>Cleaning products (e.g., bleach, detergents, sanitisers)</li>
                <li>Pesticides and insecticides (used for pest control)</li>
                <li>Kitchen chemicals (e.g., degreasers, oven cleaners)</li>
                <li>Maintenance chemicals (e.g., solvents, polishes)</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Health Risks Associated with Hazardous Substances</h4>
              <p className="text-muted-foreground">Exposure to hazardous substances can lead to:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li>Skin irritation, rashes, or burns.</li>
                <li>Respiratory problems or breathing difficulties.</li>
                <li>Eye irritation or damage.</li>
                <li>Serious health conditions from prolonged exposure, including asthma, dermatitis, and other occupational illnesses.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2. Hazard Symbols and Identifying Risks</h3>
              <p className="text-muted-foreground">It's crucial to recognise hazard symbols on product labels to understand the risks. Common hazard symbols include:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Corrosive:</span> Can cause skin burns and eye damage.</li>
                <li><span className="font-medium text-foreground">Irritant:</span> May cause skin and respiratory irritation.</li>
                <li><span className="font-medium text-foreground">Toxic:</span> Can cause serious health risks, even in small amounts.</li>
                <li><span className="font-medium text-foreground">Flammable:</span> Easily ignited; poses a fire risk.</li>
                <li><span className="font-medium text-foreground">Harmful:</span> Can cause serious harm if inhaled, swallowed, or absorbed through the skin.</li>
              </ul>
              <p className="mt-3 text-muted-foreground">Always read labels and Safety Data Sheets (SDS) for information on handling, usage, and protective equipment.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3. Safe Handling and Use of Hazardous Substances</h3>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Preparation Before Use</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><span className="font-medium text-foreground">Read the label and SDS:</span> Before using any chemical, read the product label and the SDS. This will provide details on risks, recommended protective measures, and first aid instructions.</li>
                <li><span className="font-medium text-foreground">Use PPE:</span> Wear the appropriate personal protective equipment (PPE), such as gloves, aprons, masks, or eye protection, depending on the product's instructions.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Handling Hazardous Substances</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Use only the recommended amount of product.</li>
                <li>Follow the instructions precisely—don't mix chemicals, as this can cause dangerous reactions.</li>
                <li>Use chemicals in well-ventilated areas to prevent inhalation of fumes.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Post-Use Procedures</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Wash hands and any exposed skin thoroughly after handling hazardous substances.</li>
                <li>Dispose of empty containers and leftover chemicals following the recommended guidelines.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">4. Safe Storage of Hazardous Substances</h3>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">General Storage Guidelines</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Store hazardous substances in a secure, well-ventilated area away from food and drink items.</li>
                <li>Keep substances in their original containers with labels intact.</li>
                <li>Store chemicals according to compatibility: separate acids from alkalis and flammables from oxidisers.</li>
                <li>Avoid storing chemicals at extreme temperatures, which can increase risk of spills or explosions.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Access Control</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Limit access to hazardous substances to trained staff members.</li>
                <li>Lock storage areas or cabinets to prevent unauthorised access, particularly in areas accessible to guests.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">5. Dealing with Spills and Exposure</h3>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Handling Spills</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><span className="font-medium text-foreground">Small Spills:</span> Wear the appropriate PPE, contain the spill using absorbent material, and clean the area as directed by the SDS. Dispose of any waste in designated hazardous waste bins.</li>
                <li><span className="font-medium text-foreground">Large Spills:</span> Evacuate the area, alert your manager, and follow the spill response plan. Ensure ventilation to avoid inhaling fumes.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">In Case of Exposure</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><span className="font-medium text-foreground">Skin Contact:</span> Rinse the affected area thoroughly with water for at least 15 minutes. Remove any contaminated clothing.</li>
                <li><span className="font-medium text-foreground">Eye Contact:</span> Rinse eyes with clean water for 15 minutes, holding eyelids open. Seek medical attention.</li>
                <li><span className="font-medium text-foreground">Inhalation:</span> Move to fresh air immediately. If breathing difficulties persist, call for medical help.</li>
                <li><span className="font-medium text-foreground">Ingestion:</span> Do not induce vomiting. Seek immediate medical assistance and follow instructions on the SDS.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">6. First Aid Measures for COSHH Incidents</h3>
              <p className="text-muted-foreground">When a staff member is exposed to a hazardous substance, quick and appropriate action is crucial:</p>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Minor Incidents</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide first aid as outlined in the SDS.</li>
                <li>Monitor the individual for any worsening symptoms.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Major Incidents</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Seek emergency medical attention immediately.</li>
                <li>Report the incident to a manager and complete an incident report for COSHH compliance and follow-up.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">7. Disposal of Hazardous Substances</h3>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Guidelines for Disposal</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Never pour chemicals down the drain unless explicitly stated in the SDS.</li>
                <li>Dispose of chemicals in designated hazardous waste containers.</li>
                <li>Follow local regulations for hazardous waste disposal—check with your manager if you're unsure about proper procedures.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Container Disposal</h4>
              <p className="text-muted-foreground">Empty containers should be disposed of safely and according to product instructions. Some containers may require special handling.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">8. Record Keeping and Reporting</h3>
              <p className="text-muted-foreground">Proper record-keeping ensures compliance with COSHH regulations and helps track potential risks:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Usage Logs:</span> Record the use of hazardous substances, particularly high-risk chemicals.</li>
                <li><span className="font-medium text-foreground">Incident Reports:</span> Report and document any spills, exposure incidents, or first aid treatments.</li>
                <li><span className="font-medium text-foreground">Safety Data Sheets (SDS):</span> Keep SDS for all hazardous substances on site and accessible to all staff members.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">9. Staff Responsibilities and Accountability</h3>
              <p className="text-muted-foreground">As a staff member, you have a responsibility to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li>Follow all COSHH guidelines and use PPE as instructed.</li>
                <li>Report any unsafe conditions, spills, or exposure incidents to management.</li>
                <li>Keep updated on any COSHH training or policy updates.</li>
              </ul>
              <p className="mt-3 text-muted-foreground">Managers will conduct regular COSHH training refreshers and audits to ensure staff adhere to these guidelines and maintain a safe working environment.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Conclusion</h3>
              <p className="text-muted-foreground">The COSHH regulations exist to protect the health and safety of everyone in the workplace. By following these procedures, you help to create a safer environment for yourself, your colleagues, and our guests.</p>
            </>
          ),
        },
        {
          id: 'haccp',
          title: 'HACCP',
          content: (
            <>
              <p>HACCP, or Hazard Analysis and Critical Control Points, is a systematic approach to food safety that helps identify and control potential hazards in food handling and preparation. This system ensures that food served to guests is safe and free from contaminants, minimising the risk of food-borne illness.</p>
              
              <p className="mt-4">This training will help staff understand:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li>The principles of HACCP and its importance in food safety.</li>
                <li>How to identify and control critical points in food preparation.</li>
                <li>Proper food handling, storage, and cooking techniques.</li>
                <li>Steps to take to prevent contamination and ensure a safe dining experience.</li>
              </ul>
              
              <p className="mt-4 font-semibold text-spirits-cyan">All staff members play a critical role in implementing HACCP, making food safety a top priority.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">1. Understanding HACCP Principles</h3>
              <p className="text-muted-foreground">HACCP operates on seven core principles to help control hazards in food preparation:</p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Conduct a Hazard Analysis:</span> Identify potential hazards (biological, chemical, or physical) at each stage of food preparation.</li>
                <li><span className="font-medium text-foreground">Identify Critical Control Points (CCPs):</span> Determine points in the process where control is essential to prevent or eliminate hazards (e.g., cooking, chilling).</li>
                <li><span className="font-medium text-foreground">Establish Critical Limits:</span> Define acceptable limits for each CCP (e.g., cooking chicken to 75°C to kill bacteria).</li>
                <li><span className="font-medium text-foreground">Monitor CCPs:</span> Regularly check CCPs to ensure critical limits are met.</li>
                <li><span className="font-medium text-foreground">Establish Corrective Actions:</span> Determine steps to take if a critical limit is not met.</li>
                <li><span className="font-medium text-foreground">Verify the System:</span> Regularly review processes to confirm they effectively control hazards.</li>
                <li><span className="font-medium text-foreground">Keep Records and Documentation:</span> Maintain records of monitoring, corrective actions, and verification to demonstrate compliance.</li>
              </ol>
              <p className="mt-3 text-muted-foreground">These principles guide every stage of food handling to ensure safety and quality.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2. Common Hazards in Hospitality and Food Service</h3>
              <p className="text-muted-foreground">In hospitality settings, hazards may come from various sources:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Biological Hazards:</span> Bacteria (e.g., Salmonella, E. coli), viruses (e.g., Norovirus), and parasites in raw or undercooked foods.</li>
                <li><span className="font-medium text-foreground">Chemical Hazards:</span> Cleaning agents, pesticides, and food additives that may contaminate food.</li>
                <li><span className="font-medium text-foreground">Physical Hazards:</span> Foreign objects like glass, metal, or plastic fragments that may accidentally enter food during preparation.</li>
              </ul>
              <p className="mt-3 text-muted-foreground">Identifying and controlling these hazards is essential for maintaining food safety.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3. Critical Control Points (CCPs) and Control Measures</h3>
              <p className="text-muted-foreground">CCPs are the stages where specific actions can prevent, eliminate, or reduce hazards to safe levels. Common CCPs in hospitality settings include:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Receiving Food:</span> Check quality, temperature, and condition of ingredients. Reject items that are spoiled or not up to standard.</li>
                <li><span className="font-medium text-foreground">Storage:</span> Store food at correct temperatures (e.g., refrigerated items at or below 5°C) and separate raw and cooked foods.</li>
                <li><span className="font-medium text-foreground">Preparation:</span> Prevent cross-contamination by using separate equipment and surfaces for raw and cooked foods.</li>
                <li><span className="font-medium text-foreground">Cooking:</span> Ensure food reaches safe temperatures (e.g., poultry at 75°C, minced meats at 70°C).</li>
                <li><span className="font-medium text-foreground">Cooling:</span> Rapidly cool hot food to below 5°C within 90 minutes to prevent bacterial growth.</li>
                <li><span className="font-medium text-foreground">Reheating:</span> Reheat food only once and ensure it reaches at least 75°C.</li>
                <li><span className="font-medium text-foreground">Serving:</span> Handle food with care and avoid temperature abuse.</li>
              </ul>
              <p className="mt-3 text-muted-foreground">Regular monitoring of these points is crucial to maintain control over hazards.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">4. Food Handling and Personal Hygiene</h3>
              <p className="text-muted-foreground">Proper food handling and personal hygiene practices are vital for controlling biological hazards:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Handwashing:</span> Wash hands regularly with soap and water, especially after handling raw food, using the bathroom, or touching any potentially contaminated surface.</li>
                <li><span className="font-medium text-foreground">Use of Gloves and Hairnets:</span> Wear gloves when handling ready-to-eat food and hairnets to prevent hair from falling into food.</li>
                <li><span className="font-medium text-foreground">Avoid Cross-Contamination:</span> Use separate cutting boards, knives, and utensils for raw and cooked foods. Clean and sanitize all surfaces and equipment after handling raw food.</li>
                <li><span className="font-medium text-foreground">Temperature Control:</span> Keep hot food above 63°C and cold food below 5°C. Monitor temperatures with a calibrated thermometer.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">5. Establishing Critical Limits and Monitoring Procedures</h3>
              <p className="text-muted-foreground">Critical limits are the specific criteria that must be met at each CCP to ensure food safety. Examples of critical limits include:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Temperature Control:</span> Cook poultry to 75°C; store cold food at or below 5°C.</li>
                <li><span className="font-medium text-foreground">Time Control:</span> Cool cooked foods to below 5°C within 90 minutes.</li>
              </ul>
              
              <p className="mt-3 text-muted-foreground">Monitoring involves regularly checking these limits, using tools like thermometers and timers. For instance:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li>Check fridge and freezer temperatures at least twice daily.</li>
                <li>Use a thermometer to verify cooking temperatures for each batch of cooked food.</li>
                <li>Monitor hot holding temperatures to keep food above 63°C.</li>
              </ul>
              <p className="mt-3 text-muted-foreground">Consistency in monitoring helps catch any deviations quickly, allowing for immediate corrective actions.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">6. Corrective Actions</h3>
              <p className="text-muted-foreground">When a critical limit is not met, take corrective actions to prevent unsafe food from reaching customers:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Temperature Issues:</span> If a refrigerator is above 5°C, move perishable food to a functioning refrigerator and report the issue for repair.</li>
                <li><span className="font-medium text-foreground">Undercooked Food:</span> If a cooked dish does not reach its critical temperature, return it to the heat source until it reaches the correct temperature.</li>
                <li><span className="font-medium text-foreground">Cross-Contamination:</span> If raw meat touches ready-to-eat food, discard the contaminated food and clean surfaces thoroughly.</li>
              </ul>
              <p className="mt-3 text-muted-foreground">Document all corrective actions taken to show that deviations were managed properly.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">7. Verification and Record-Keeping</h3>
              <p className="text-muted-foreground">Verification and documentation demonstrate compliance with HACCP and ensure consistent food safety:</p>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Verification:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Conduct regular audits of HACCP procedures.</li>
                <li>Review temperature logs, cooking records, and corrective actions.</li>
                <li>Test staff knowledge of HACCP procedures during periodic training sessions.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Record-Keeping:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Maintain temperature logs for refrigerators, freezers, and hot holding units.</li>
                <li>Keep cooking and reheating temperature records.</li>
                <li>Document all corrective actions and verification activities.</li>
              </ul>
              <p className="mt-3 text-muted-foreground">Proper documentation allows for accountability and helps identify any areas needing improvement.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">8. Staff Training and Responsibilities</h3>
              <p className="text-muted-foreground">All staff members must be trained in HACCP principles to understand the importance of each CCP and critical limit. Responsibilities include:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Kitchen Staff:</span> Adhere to food handling and preparation standards, monitor CCPs, and take corrective actions when necessary.</li>
                <li><span className="font-medium text-foreground">Front-of-House Staff:</span> Inform guests of any food safety practices, handle food safely, and avoid cross-contact (especially important for allergens).</li>
                <li><span className="font-medium text-foreground">Management:</span> Ensure HACCP compliance, provide training, conduct regular audits, and update procedures as necessary.</li>
              </ul>
              <p className="mt-3 text-muted-foreground">Regular HACCP training sessions keep everyone up-to-date and reinforce food safety practices.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">9. Preventing Food Contamination</h3>
              <p className="text-muted-foreground">Contamination can occur at any stage, so preventive measures are crucial:</p>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Purchasing and Receiving:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Source ingredients from reputable suppliers.</li>
                <li>Inspect deliveries for freshness, damage, and temperature control.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Storage:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Label and date all foods.</li>
                <li>Use the FIFO (First In, First Out) method to prevent expired items from being used.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Preparation and Cooking:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Separate raw and cooked foods to avoid cross-contamination.</li>
                <li>Follow established cooking times and temperatures to kill harmful bacteria.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Serving:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Serve food as soon as possible after preparation.</li>
                <li>Avoid handling food with bare hands; use tongs or gloves.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">10. Commitment to Food Safety</h3>
              <p className="text-muted-foreground">By following HACCP principles, we ensure that food served at our venue is safe, consistent, and meets the highest standards. Each staff member's commitment to food safety practices is essential to delivering a quality experience to our guests.</p>
              <p className="mt-3 text-muted-foreground">Food safety isn't just about compliance—it's about protecting our guests' health, preserving the venue's reputation, and building trust with every meal served.</p>
            </>
          ),
        },
        {
          id: 'manual-handling',
          title: 'Manual Handling',
          content: (
            <>
              <p>Manual handling involves any activity requiring a person to lift, lower, push, pull, or carry a load. In a hospitality setting, tasks like moving boxes, lifting supplies, handling trays, and setting up furniture all fall under manual handling. Poor manual handling techniques can lead to injuries, especially to the back, shoulders, and arms, which can have long-term consequences.</p>
              
              <p className="mt-4">This training will help staff understand:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li>The risks of improper manual handling.</li>
                <li>Techniques for safe manual handling.</li>
                <li>Preventative measures to reduce injury.</li>
                <li>Practical steps to assess and improve manual handling tasks.</li>
              </ul>
              
              <p className="mt-4 font-semibold text-spirits-cyan">Safety in manual handling is critical to prevent injury, reduce fatigue, and maintain a productive and healthy work environment.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">1. Understanding Manual Handling Risks</h3>
              <p className="text-muted-foreground">Improper manual handling can lead to injuries such as:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Back pain and spine injuries:</span> Strain or injury to the muscles and discs in the spine.</li>
                <li><span className="font-medium text-foreground">Joint and ligament injuries:</span> Damage to the shoulders, knees, or elbows.</li>
                <li><span className="font-medium text-foreground">Muscle strain:</span> Overstretching or tearing muscles, often in the lower back or legs.</li>
              </ul>
              
              <p className="mt-3 text-muted-foreground">Factors that increase the risk of injury include:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li>Lifting heavy or awkward loads.</li>
                <li>Bending, twisting, or reaching while carrying a load.</li>
                <li>Repetitive lifting or handling over extended periods.</li>
                <li>Poor posture or incorrect lifting technique.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2. Planning Manual Handling Tasks</h3>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Assess the Load</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><span className="font-medium text-foreground">Size and Shape:</span> Check if the load is manageable. Awkwardly shaped or oversized items may be difficult to handle alone.</li>
                <li><span className="font-medium text-foreground">Weight:</span> Test the weight by lifting one corner. If it feels too heavy, seek assistance.</li>
                <li><span className="font-medium text-foreground">Stability:</span> Ensure the load is stable and won't shift or fall when lifted.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Plan Your Route</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><span className="font-medium text-foreground">Clear Obstacles:</span> Make sure the path to your destination is clear of tripping hazards, spills, or obstacles.</li>
                <li><span className="font-medium text-foreground">Use Assistance if Needed:</span> Use trolleys, dollies, or ask a colleague for help if the load is heavy or difficult to manoeuvre.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Break Down the Load</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><span className="font-medium text-foreground">Separate into Smaller Loads:</span> If possible, divide the load into smaller, more manageable parts.</li>
                <li><span className="font-medium text-foreground">Assess if Mechanical Aids are Needed:</span> Consider using lifting aids for heavier or larger items.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3. Safe Manual Handling Techniques</h3>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Correct Lifting Technique</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><span className="font-medium text-foreground">Feet Position:</span> Stand close to the load with feet shoulder-width apart for balance. Position one foot slightly ahead of the other.</li>
                <li><span className="font-medium text-foreground">Bend Your Knees:</span> Bend at the knees and hips, not the waist. This keeps the back straight and uses leg muscles for lifting.</li>
                <li><span className="font-medium text-foreground">Grip the Load Firmly:</span> Use both hands to get a secure grip on the load.</li>
                <li><span className="font-medium text-foreground">Keep Your Back Straight:</span> Maintain a straight back with natural curvature throughout the lift. Avoid bending or twisting your back.</li>
                <li><span className="font-medium text-foreground">Lift with Your Legs:</span> Straighten your legs to lift the load while keeping it close to your body. Avoid jerking movements.</li>
                <li><span className="font-medium text-foreground">Keep the Load Close:</span> Hold the load close to your body to minimise strain on your back.</li>
                <li><span className="font-medium text-foreground">Move Smoothly:</span> Avoid sudden movements. If turning is necessary, move your feet instead of twisting your back.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Lowering the Load</h4>
              <p className="text-muted-foreground">Bend your knees, keeping your back straight, and place the load down gently. Avoid dropping the load suddenly, as this could lead to injury or damage to the load.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">4. Safe Pushing and Pulling Techniques</h3>
              <p className="text-muted-foreground">Sometimes pushing or pulling is necessary, such as when moving carts or trolleys. To minimise strain:</p>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Pushing</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Use Body Weight: Position yourself close to the object and use your body weight to help push.</li>
                <li>Keep Back Straight: Maintain a stable posture with a straight back.</li>
                <li>Face Forward: Avoid twisting your body while pushing.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Pulling</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Keep Elbows Close: Keep your elbows close to your body for better control and to reduce strain.</li>
                <li>Use Both Hands: Use both hands to distribute the weight evenly.</li>
              </ul>
              <p className="mt-3 text-muted-foreground italic">Note: Pushing is generally safer and less strenuous than pulling.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">5. Reducing Manual Handling Risks in Hospitality</h3>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Use Mechanical Aids When Possible</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Use trolleys, dollies, or carts to transport heavy or bulky items.</li>
                <li>Ensure mechanical aids are in good working order and report any issues to management.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Organise and Arrange Workstations</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Place frequently used items within easy reach to reduce the need for bending or stretching.</li>
                <li>Store heavier items at waist height whenever possible to minimise lifting.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Limit Repetitive Tasks</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Take breaks when handling repetitive tasks to avoid fatigue and strain.</li>
                <li>Rotate tasks with other team members if possible, especially during long shifts.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Seek Assistance</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>If an item is too heavy or awkward to lift alone, ask a colleague for help.</li>
                <li>Avoid lifting items that exceed your comfort or physical capacity.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">6. Lifting and Handling Trays and Plates</h3>
              <p className="text-muted-foreground">In hospitality, carrying trays, plates, and glassware is a common task that can lead to strain if done improperly. Here are tips for safe tray and plate handling:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Limit the Number of Plates:</span> Only carry as many plates or glasses as you can handle comfortably and safely.</li>
                <li><span className="font-medium text-foreground">Use Balanced Trays:</span> Arrange items evenly on trays to maintain balance and prevent spills.</li>
                <li><span className="font-medium text-foreground">Carry Close to Body:</span> Hold trays or large plates close to your torso for better control and reduced strain.</li>
                <li><span className="font-medium text-foreground">Avoid Overreaching:</span> When placing items on tables, avoid overreaching to prevent strain on your back and shoulders.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">7. Reporting Injuries and Near Misses</h3>
              <p className="text-muted-foreground">If you experience any discomfort, pain, or injury while handling a load:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Stop the Task:</span> Do not continue if you feel strain or pain.</li>
                <li><span className="font-medium text-foreground">Report to Management:</span> Immediately report any injury or near miss to your manager or supervisor.</li>
                <li><span className="font-medium text-foreground">Seek Medical Attention if Necessary:</span> If an injury requires treatment, visit a healthcare professional promptly.</li>
              </ul>
              <p className="mt-3 text-muted-foreground">Recording incidents helps management improve safety measures and reduce the risk of future injuries.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">8. Management's Role in Manual Handling Safety</h3>
              <p className="text-muted-foreground">Management will provide:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Ongoing Training:</span> Regular training sessions to refresh manual handling knowledge.</li>
                <li><span className="font-medium text-foreground">Access to Mechanical Aids:</span> Trolleys, carts, and other equipment to reduce the strain of lifting.</li>
                <li><span className="font-medium text-foreground">Hazard Assessments:</span> Regular assessments to identify and mitigate manual handling risks in the workplace.</li>
                <li><span className="font-medium text-foreground">Feedback Opportunities:</span> Staff can provide feedback on manual handling practices to ensure a safer work environment.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Conclusion</h3>
              <p className="text-muted-foreground">Manual handling is an essential aspect of hospitality work, but without proper technique and precaution, it can lead to serious injuries. By following safe handling techniques, using mechanical aids, and knowing when to ask for help, you contribute to a safer, more efficient, and comfortable work environment.</p>
            </>
          ),
        },
        {
          id: 'conflict-management',
          title: 'CONFLICT MANAGEMENT',
          content: (
            <>
              <p>In the hospitality industry, excellent customer service is paramount. However, conflicts can arise from a variety of sources—whether from misunderstandings with guests, pressure from busy shifts, or interpersonal issues among staff. Learning effective conflict management techniques helps create a positive environment, ensures guest satisfaction, and maintains team morale.</p>
              
              <p className="mt-4">This training document will help staff understand:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li>Types of conflicts that may arise in a hospitality setting.</li>
                <li>Techniques for resolving conflicts with guests and colleagues.</li>
                <li>How to maintain professionalism and empathy in challenging situations.</li>
                <li>The importance of clear communication and active listening.</li>
              </ul>
              
              <p className="mt-4 font-semibold text-spirits-cyan">Effective conflict management is a key skill for delivering exceptional service and maintaining a positive workplace.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">1. Understanding Common Sources of Conflict in Hospitality</h3>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Conflicts with Guests</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><span className="font-medium text-foreground">Service Issues:</span> Long wait times, incorrect orders, or unmet expectations.</li>
                <li><span className="font-medium text-foreground">Misunderstandings:</span> Miscommunication about policies (e.g., reservation requirements, billing).</li>
                <li><span className="font-medium text-foreground">High Expectations:</span> Some guests may have high or specific expectations that are difficult to meet.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Conflicts Among Staff</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><span className="font-medium text-foreground">Workload Distribution:</span> Unequal workloads or perceived unfairness in assigned tasks.</li>
                <li><span className="font-medium text-foreground">Communication Gaps:</span> Misunderstandings due to unclear instructions or poor communication.</li>
                <li><span className="font-medium text-foreground">Personality Clashes:</span> Differences in personalities, work styles, or personal stressors.</li>
              </ul>
              
              <p className="mt-3 text-muted-foreground">Understanding the potential causes of conflict can help you anticipate and address issues before they escalate.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2. Principles of Effective Conflict Management</h3>
              <p className="text-muted-foreground">Successful conflict management requires:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Remaining Calm:</span> Approach each situation with composure.</li>
                <li><span className="font-medium text-foreground">Listening Actively:</span> Listen to understand rather than respond immediately.</li>
                <li><span className="font-medium text-foreground">Showing Empathy:</span> Acknowledge feelings, whether from a guest or colleague.</li>
                <li><span className="font-medium text-foreground">Staying Professional:</span> Avoid responding defensively or with frustration.</li>
                <li><span className="font-medium text-foreground">Problem-Solving Mindset:</span> Focus on finding solutions rather than dwelling on the problem.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3. Conflict Resolution Techniques for Guest Interactions</h3>
              
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Remain Calm and Attentive</span>
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li>Take a deep breath and approach the guest with a calm demeanour.</li>
                    <li>Make eye contact and use open body language to show you're listening.</li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium text-foreground">Listen Actively</span>
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li>Allow the guest to express their concerns without interruption.</li>
                    <li>Nod or use brief affirmations ("I understand" or "I see") to show you're paying attention.</li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium text-foreground">Show Empathy</span>
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li>Use empathetic statements such as, "I understand this must be frustrating for you" or "I'm sorry for the inconvenience."</li>
                    <li>This helps to acknowledge their feelings and reduces the likelihood of escalation.</li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium text-foreground">Ask Questions and Clarify the Issue</span>
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li>Ask open-ended questions like, "Can you tell me more about what happened?" to clarify the issue.</li>
                    <li>Repeat back key points to confirm your understanding and show that you are invested in finding a solution.</li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium text-foreground">Offer Solutions and Take Action</span>
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li>Offer clear and reasonable solutions (e.g., a replacement, discount, or alternative seating).</li>
                    <li>If the solution requires time or assistance from a manager, inform the guest of what to expect.</li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium text-foreground">Follow Up When Possible</span>
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li>After resolving the issue, check in to ensure the guest is satisfied.</li>
                    <li>This gesture shows care and can turn a negative experience into a positive one.</li>
                  </ul>
                </li>
              </ol>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">4. Conflict Resolution Techniques for Colleague Interactions</h3>
              
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Address the Issue Privately and Respectfully</span>
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li>Speak to your colleague in a private setting to discuss the issue without causing embarrassment or escalating tension.</li>
                    <li>Avoid confrontational language—use "I" statements instead of "you" statements (e.g., "I feel concerned when…" rather than "You always…").</li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium text-foreground">Practice Active Listening</span>
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li>Listen to your colleague's perspective without interrupting.</li>
                    <li>Paraphrase their points to confirm your understanding and show respect for their views.</li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium text-foreground">Focus on Common Goals</span>
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li>Emphasise shared goals, such as providing excellent service or maintaining a positive work environment.</li>
                    <li>Avoid personal criticisms; focus on behaviours rather than character.</li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium text-foreground">Find a Mutually Acceptable Solution</span>
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li>Collaborate to find a solution that works for both parties, such as redistributing tasks or agreeing on clearer communication.</li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium text-foreground">Seek Assistance if Needed</span>
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li>If the conflict cannot be resolved independently, seek guidance from a supervisor or manager.</li>
                    <li>It's better to resolve a conflict constructively than let it affect team dynamics or service quality.</li>
                  </ul>
                </li>
              </ol>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">5. Effective Communication Skills for Conflict Management</h3>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Use Positive Language</h4>
              <p className="text-muted-foreground">Avoid negative words like "can't" or "won't" and focus on what you can do. For example, instead of saying, "We don't have that dish available," try, "We have a variety of other options, and I'd be happy to recommend something."</p>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Nonverbal Communication</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Maintain open and relaxed body language.</li>
                <li>Smile when appropriate to convey friendliness and ease tension.</li>
                <li>Avoid crossed arms or rolling your eyes, which can seem dismissive.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Assertiveness over Aggression</h4>
              <p className="text-muted-foreground">Speak confidently but remain respectful. Assertiveness involves expressing yourself clearly without undermining or disrespecting the other person.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">6. Handling Aggressive or Upset Guests</h3>
              <p className="text-muted-foreground">If a guest becomes aggressive or hostile, it's important to manage the situation calmly and professionally:</p>
              
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Remain Calm and Avoid Escalation:</span> Keep your tone and body language calm, regardless of the guest's tone. Avoid mirroring aggressive behaviour, which can worsen the situation.</li>
                <li><span className="font-medium text-foreground">Listen Without Interrupting:</span> Often, guests become less upset once they feel they've been heard. Let them vent if necessary, then respond thoughtfully and empathetically.</li>
                <li><span className="font-medium text-foreground">Set Boundaries if Needed:</span> If a guest uses abusive language or becomes too aggressive, politely set boundaries: "I'm here to help, but I would appreciate it if we could speak calmly so I can better assist you."</li>
                <li><span className="font-medium text-foreground">Know When to Involve Management:</span> If the situation escalates or feels unsafe, involve a manager. They have the authority and experience to de-escalate difficult situations.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">7. De-Escalation Strategies for Difficult Situations</h3>
              <p className="text-muted-foreground">In some situations, de-escalation techniques are necessary to prevent conflicts from worsening:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Take a Step Back:</span> Politely excuse yourself for a moment to gather your thoughts or to consult with a manager. This can also give the guest or colleague a chance to cool down.</li>
                <li><span className="font-medium text-foreground">Stay Solution-Focused:</span> Ask, "What can I do to make this right for you?" to shift focus to problem-solving rather than arguing.</li>
                <li><span className="font-medium text-foreground">Validate Their Emotions:</span> Say things like, "I can see why you're upset," to acknowledge their feelings and show empathy.</li>
                <li><span className="font-medium text-foreground">Express Appreciation for Patience:</span> Use phrases like, "Thank you for your patience," to recognise their cooperation, which can help ease tensions.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">8. Reporting and Learning from Conflict</h3>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Documenting Incidents</h4>
              <p className="text-muted-foreground">After a conflict, document the incident to record what occurred, how it was handled, and any steps taken to resolve it. Documenting conflicts helps management address recurring issues and adjust policies if necessary.</p>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Review and Reflect</h4>
              <p className="text-muted-foreground">Take time to reflect on the situation and identify ways to improve future interactions. Discussing difficult situations in team meetings can also help others learn from the experience and improve conflict management skills.</p>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Seek Support if Needed</h4>
              <p className="text-muted-foreground">If a situation was particularly stressful, seek support from a manager or HR. Your well-being is important, and discussing concerns can be helpful.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">9. Management's Role in Supporting Conflict Resolution</h3>
              <p className="text-muted-foreground">Managers will:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Provide Guidance and Support:</span> Be available to assist in conflict situations and model effective conflict resolution behaviours.</li>
                <li><span className="font-medium text-foreground">Offer Ongoing Training:</span> Conduct regular training sessions to refresh skills in conflict management and customer service.</li>
                <li><span className="font-medium text-foreground">Encourage Open Communication:</span> Maintain an open-door policy for staff to discuss conflicts or concerns in a supportive environment.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Conclusion</h3>
              <p className="text-muted-foreground">Effective conflict management is essential for delivering high-quality service, maintaining a positive work environment, and ensuring the satisfaction of guests and team members alike. By mastering these skills, staff can handle challenging situations confidently, professionally, and constructively.</p>
            </>
          ),
        },
        {
          id: 'fire-safety',
          title: 'Fire Safety',
          content: (
            <>
              <p>Fire safety is critical in any workplace, and Gaitens Leisure Group is committed to ensuring the safety of our staff, guests, and property. Knowing fire safety procedures helps prevent fires and prepares us to respond effectively in the event of an emergency.</p>
              
              <p className="mt-4">This document covers:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li>Fire prevention measures</li>
                <li>Procedures for identifying and reporting fire risks</li>
                <li>Emergency response procedures, including evacuation routes and meeting points</li>
                <li>The roles and responsibilities of staff in a fire emergency</li>
              </ul>
              
              <div className="mt-4 p-4 bg-garrison-orange/10 border border-garrison-orange/30 rounded-lg">
                <p className="font-semibold text-garrison-orange">⚠️ Remember: fire safety is everyone's responsibility. Please review this document carefully and participate actively in all fire safety drills.</p>
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">1. Fire Prevention Measures</h3>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">General Fire Safety Rules</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><span className="font-medium text-foreground">No Smoking:</span> Smoking is only allowed in designated smoking areas.</li>
                <li><span className="font-medium text-foreground">Proper Disposal of Waste:</span> Dispose of rubbish and flammable materials, such as paper or packaging, in appropriate bins.</li>
                <li><span className="font-medium text-foreground">Appliance Safety:</span> Ensure all appliances and equipment are turned off after use, especially in high-risk areas like the kitchen and bar. Unplug equipment when not in use, if possible.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Fire Hazards to Avoid</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><span className="font-medium text-foreground">Avoid Overloading Electrical Outlets:</span> Do not plug multiple high-wattage appliances into a single outlet.</li>
                <li><span className="font-medium text-foreground">Keep Fire Exits and Pathways Clear:</span> Never block emergency exits, hallways, or access routes.</li>
                <li><span className="font-medium text-foreground">Safe Storage of Flammable Materials:</span> Store cleaning chemicals and other flammable substances in designated areas.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2. Fire Detection and Alarm Systems</h3>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Fire Alarms</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><span className="font-medium text-foreground">Location of Fire Alarm Panels:</span> Fire alarm panels are located throughout the venue.</li>
                <li><span className="font-medium text-foreground">How to Activate the Fire Alarm:</span> In the event of a fire, activate the nearest manual fire alarm pull station.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Fire Extinguishers</h4>
              <p className="text-muted-foreground">Fire extinguishers are located throughout the venue and are designed for specific types of fires:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Water Extinguishers:</span> For paper, wood, and fabric fires.</li>
                <li><span className="font-medium text-foreground">CO2 Extinguishers:</span> For electrical fires.</li>
                <li><span className="font-medium text-foreground">Foam Extinguishers:</span> For flammable liquids.</li>
              </ul>
              <div className="mt-3 p-3 bg-garrison-orange/10 border border-garrison-orange/30 rounded-lg">
                <p className="text-sm font-semibold text-garrison-orange">⚠️ Note: Only trained staff should attempt to use fire extinguishers. In case of uncertainty, evacuate immediately and wait for emergency services.</p>
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3. Fire Emergency Response Plan</h3>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Identifying and Reporting Fire Hazards</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>If you notice a potential fire hazard, report it immediately to your manager or supervisor.</li>
                <li>For faulty equipment, label it as "out of service" and notify management.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">In Case of Fire</h4>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li><span className="font-medium text-foreground">Raise the Alarm:</span> If you see smoke or fire, immediately activate the fire alarm at the nearest pull station.</li>
                <li><span className="font-medium text-foreground">Evacuate the Area:</span> Inform those nearby and proceed to the nearest emergency exit. Avoid using lifts/elevators.</li>
                <li><span className="font-medium text-foreground">Evacuation Routes:</span> Follow designated routes as indicated on fire safety maps located throughout the venue.</li>
                <li><span className="font-medium text-foreground">Report to the Assembly Point:</span> Once outside, proceed directly to the designated meeting point(s).</li>
                <li><span className="font-medium text-foreground">Accountability:</span> Managers or designated fire wardens will conduct a roll call to account for all staff and guests. Report to your manager or fire warden upon reaching the assembly point.</li>
              </ol>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">4. Evacuation Roles and Responsibilities</h3>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">All Staff</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Be familiar with evacuation routes, meeting points, and fire extinguisher locations.</li>
                <li>Assist guests in evacuating the premises, especially those who may need additional help.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Fire Wardens</h4>
              <p className="text-muted-foreground">Designated Fire Wardens are responsible for checking specific areas, directing guests, and ensuring no one is left behind. Fire Wardens should:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li>Check all rooms and facilities within their assigned area.</li>
                <li>Guide people safely to exits and ensure clear communication.</li>
                <li>Report to management or emergency responders at the assembly point.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Managers and Supervisors</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Ensure staff compliance with fire safety procedures and oversee evacuation efforts.</li>
                <li>Communicate with emergency responders upon their arrival and provide any necessary information.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">5. Procedures for Assisting Guests with Special Needs</h3>
              <p className="text-muted-foreground">We prioritise the safe evacuation of all guests, including those with disabilities or special needs.</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Guests with Mobility Impairments:</span> Assign a staff member to assist guests in wheelchairs or with mobility limitations, guiding them to the safest and most accessible exits.</li>
                <li><span className="font-medium text-foreground">Guests with Visual Impairments:</span> Verbally guide visually impaired guests along evacuation routes, providing clear directions.</li>
                <li><span className="font-medium text-foreground">Guests with Hearing Impairments:</span> Use hand signals or written instructions to guide guests with hearing impairments.</li>
                <li>Inform management if any guests with special needs require additional support at the assembly point.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">6. Post-Evacuation Procedures</h3>
              <p className="text-muted-foreground">After evacuating to the assembly point, follow these steps:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li><span className="font-medium text-foreground">Conduct a Roll Call:</span> Fire wardens and managers will take roll call to account for all staff and known guests.</li>
                <li><span className="font-medium text-foreground">Report Missing Persons:</span> If anyone is unaccounted for, inform emergency personnel immediately.</li>
                <li><span className="font-medium text-foreground">Wait for Clearance:</span> Do not re-enter the building until emergency services declare it safe.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">7. Fire Drills and Training</h3>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Fire Drills</h4>
              <p className="text-muted-foreground">Fire drills are conducted regularly to practice evacuation procedures. All staff are required to participate to ensure familiarity with escape routes and procedures.</p>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">Ongoing Fire Safety Training</h4>
              <p className="text-muted-foreground">Staff will receive fire safety training on a regular basis to stay updated on protocols and procedures. Fire safety briefings will be given to new staff as part of their onboarding.</p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">8. Contact Information for Emergency Services and Safety Personnel</h3>
              
              <h4 className="text-lg font-semibold text-spirits-cyan mt-4 mb-2">In Case of Emergency</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><span className="font-medium text-foreground">Emergency Services:</span> Dial 999 from any phone.</li>
                <li><span className="font-medium text-foreground">Internal Emergency Contacts:</span> Contact your manager or supervisor on duty immediately.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">9. Staff Acknowledgment and Responsibility</h3>
              <p className="text-muted-foreground">All staff members are required to acknowledge their understanding of this fire safety training document. This signature indicates that they understand the fire safety procedures and know their responsibilities in case of a fire emergency.</p>
              
              <div className="mt-4 p-4 bg-[oklch(0.14_0_0)] border border-border/30 rounded-lg">
                <h4 className="text-lg font-semibold text-spirits-cyan mb-3">Staff Acknowledgment</h4>
                <div className="space-y-3 text-muted-foreground">
                  <p>Signature: ______________________</p>
                  <p>Printed Name: __________________</p>
                  <p>Date: ___________________________</p>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Conclusion</h3>
              <p className="text-muted-foreground">Fire safety is a shared responsibility. By following these procedures, you help create a safe environment for staff, guests, and visitors at Gaitens Leisure Group. Remain vigilant, adhere to fire safety protocols, and participate in regular fire drills and training to be prepared for any fire emergency.</p>
            </>
          ),
        },
        // Add more safety sections here
      ],
    },
  ]

  // Determine which book to show (no default selection)
  const currentBookId = searchParams?.book
  const currentBook = currentBookId ? books.find(b => b.id === currentBookId) : null
  
  // Determine which section to show within the book
  const sectionIds = currentBook?.sections.map(s => s.id) || []
  const currentSectionId = searchParams?.section
  const currentIndex = currentSectionId && currentBook ? sectionIds.indexOf(currentSectionId) : -1
  const currentSection = currentSectionId && currentIndex >= 0 && currentBook
    ? currentBook.sections[currentIndex] 
    : null
  
  // Show contents page if no section is selected but book is selected
  const showContents = currentBook && (!currentSectionId || currentIndex < 0)
  const showLanding = !currentBook
  
  // Get highlight search words from URL
  const highlightQuery = searchParams?.highlight || ''
  const highlightWords = highlightQuery
    ? highlightQuery
        .split(/\s+/)
        .filter(word => word.length >= 2)
        .map(word => word.toLowerCase())
    : []

  return (
    <div className="min-h-screen relative z-10 pb-32">
      {/* Fixed Header - always show */}
      <HandbookHeader
        books={books.map(b => ({ id: b.id, title: b.title }))}
        currentBookId={currentBookId || undefined}
        currentSectionTitle={currentSection?.title}
        sections={currentBook?.sections.map(s => ({ id: s.id, title: s.title }))}
      />
      
      {/* Spacer for fixed header - accounts for safe area */}
      <div 
        style={{
          height: 'calc(env(safe-area-inset-top, 0px) + 64px)',
        }}
        className="sm:h-[calc(env(safe-area-inset-top,0px)+73px)]"
      />

      {showLanding ? (
        <HandbookLandingWithSearchOverlay books={books} />
      ) : currentBook ? (
        <HandbookBookViewWithSearchOverlay books={books}>
          {currentBook.sections.length > 0 ? (
            <>
              {showContents ? (
                <div className="relative z-10">
                  {/* Page Title */}
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                      Contents
                    </h2>
                    <p className="text-muted-foreground text-lg">
                      Select a section to begin reading
                    </p>
                  </div>
                  
                  <Page>
                    <PageContent className="max-w-4xl mx-auto">
                      <HandbookContentsList
                        sections={currentBook.sections.map(s => ({ id: s.id, title: s.title }))}
                        bookId={currentBookId!}
                      />
                    </PageContent>
                  </Page>
                </div>
              ) : (
                <>
                  {/* Page Title */}
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 relative z-10">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                      {currentSection?.title}
                    </h2>
                  </div>
                  
                  <Page className="rounded-none mx-0 relative z-10">
                    <PageContent className="max-w-none px-0">
                      <div className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground px-4 sm:px-6 lg:px-8">
                        <HighlightContent searchWords={highlightWords}>
                          {currentSection?.content}
                        </HighlightContent>
                      </div>
                    </PageContent>
                  </Page>
                  
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <HandbookNavigation
                      currentIndex={currentIndex}
                      totalSections={currentBook.sections.length}
                      sectionIds={sectionIds}
                      bookId={currentBookId!}
                    />
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="relative z-10">
              <Page>
                <PageContent className="py-12 text-center max-w-4xl mx-auto">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Handbook Coming Soon
                  </h2>
                  <p className="text-muted-foreground">
                    The staff handbook is being prepared. Check back soon for updates.
                  </p>
                </PageContent>
              </Page>
            </div>
          )}
        </HandbookBookViewWithSearchOverlay>
      ) : null}

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  )
}
