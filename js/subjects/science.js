/* Science — biology, chemistry, physics, earth & space, and how science is actually done. */
(function (SH) {
  'use strict';
  var U = SH.U;

  /* Each item: [question, [options — first one is correct], explanation] */
  var BIOLOGY = [
    ['What is the role of ribosomes?', ['They build proteins from amino acids', 'They store DNA', 'They release energy', 'They digest waste'], 'Ribosomes read mRNA and assemble the protein it codes for.', 3],
    ['Which molecule carries the code from DNA to the ribosome?', ['mRNA', 'ATP', 'Glucose', 'Haemoglobin'], 'Messenger RNA is transcribed from DNA and travels out of the nucleus.', 3],
    ['Roughly how much energy passes from one level of a food chain to the next?', ['About 10% — most is lost as heat', '100%', 'About 90%', 'None'], 'That loss is why food chains rarely have more than four or five levels.', 3],
    ['What is homeostasis?', ['Keeping internal conditions stable', 'Copying DNA before division', 'Building new proteins', 'Fighting infection'], 'Temperature, blood sugar and water balance are all held within narrow limits.', 3],
    ['Which of these is a living thing?', ['A tree', 'A rock', 'A cloud', 'A spoon'], 'Living things grow, feed and reproduce. A tree does; a rock does not.', 1],
    ['What do humans breathe in to stay alive?', ['Oxygen', 'Carbon dioxide', 'Helium', 'Smoke'], 'We take oxygen from the air into our lungs.', 1],
    ['Which body part do you use to smell?', ['Nose', 'Ear', 'Elbow', 'Knee'], 'The nose contains cells that detect smells.', 1],
    ['What do plants need to grow?', ['Water, light and air', 'Only sand', 'Only darkness', 'Only ice'], 'Plants need water, light, air and nutrients from soil.', 1],
    ['A baby frog is called a...', ['Tadpole', 'Puppy', 'Calf', 'Chick'], 'Frogs hatch as tadpoles and grow legs later.', 1],
    ['Which animal is a mammal?', ['Dog', 'Snake', 'Frog', 'Goldfish'], 'Mammals have fur and feed their young milk.', 1],
    ['Where do fish live?', ['In water', 'In trees', 'Underground', 'In clouds'], 'Fish use gills to take oxygen from water.', 1],
    ['What happens to a seed when you water it and give it light?', ['It grows into a plant', 'It turns into a stone', 'It disappears', 'It becomes an animal'], 'Seeds germinate and grow into new plants.', 1],
    ['Which organelle releases most of a cell\'s usable energy?', ['Mitochondrion', 'Ribosome', 'Nucleus', 'Golgi body'], 'Mitochondria carry out aerobic respiration, producing ATP.', 2],
    ['What do plants use to capture light during photosynthesis?', ['Chlorophyll', 'Haemoglobin', 'Keratin', 'Insulin'], 'Chlorophyll in the chloroplasts absorbs light, mainly red and blue wavelengths.', 2],
    ['Which gas do plants take in for photosynthesis?', ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Methane'], 'Plants take in CO₂ and release oxygen as a by-product.', 1],
    ['What carries genetic instructions in almost every living cell?', ['DNA', 'ATP', 'Glucose', 'Collagen'], 'DNA stores the sequence that codes for proteins.', 2],
    ['Which blood cells carry oxygen around the body?', ['Red blood cells', 'White blood cells', 'Platelets', 'Plasma cells'], 'Red blood cells contain haemoglobin, which binds oxygen.', 1],
    ['What is the basic unit of life?', ['The cell', 'The atom', 'The organ', 'The molecule'], 'All living things are made of one or more cells.', 1],
    ['Which system removes waste from the blood?', ['The kidneys', 'The lungs alone', 'The liver alone', 'The pancreas'], 'The kidneys filter blood and produce urine.', 2],
    ['A food chain always begins with a...', ['Producer', 'Herbivore', 'Predator', 'Decomposer'], 'Producers such as plants make their own food from sunlight.', 1],
    ['What is the role of enzymes?', ['They speed up reactions in living things', 'They store genetic code', 'They carry oxygen', 'They build cell walls'], 'Enzymes are biological catalysts; they lower activation energy.', 3],
    ['Which process do cells use to divide for growth and repair?', ['Mitosis', 'Meiosis', 'Osmosis', 'Digestion'], 'Mitosis produces two genetically identical cells.', 3],
    ['Osmosis is the movement of...', ['Water across a partially permeable membrane', 'Salt through a pipe', 'Oxygen through the lungs', 'Sugar into the blood'], 'Water moves from a dilute to a more concentrated solution.', 3],
    ['Which part of a plant absorbs water and minerals?', ['The roots', 'The leaves', 'The flower', 'The stem tip'], 'Root hair cells give a large surface area for absorption.', 1],
    ['What does the skeleton NOT do?', ['Produce insulin', 'Support the body', 'Protect organs', 'Make blood cells'], 'Insulin is produced by the pancreas, not by bone.', 2],
    ['Vertebrates are animals that have...', ['A backbone', 'Wings', 'Cold blood', 'Six legs'], 'Vertebrates include fish, amphibians, reptiles, birds and mammals.', 1],
    ['Natural selection means that...', ['Individuals better suited to their environment tend to survive and reproduce', 'Animals choose their own traits', 'All mutations are helpful', 'Species never change'], 'Advantageous variations become more common over generations.', 3],
    ['Which organ pumps blood around the body?', ['The heart', 'The lungs', 'The spleen', 'The liver'], 'The heart is a muscular double pump.', 1],
    ['Bacteria differ from animal cells because bacteria have...', ['No nucleus', 'No DNA', 'No cell membrane', 'No ribosomes'], 'Bacteria are prokaryotes: their DNA floats free in the cytoplasm.', 3],
    ['What is a habitat?', ['The place where an organism lives', 'The food an animal eats', 'A group of the same species', 'The role a species plays'], 'The habitat is the physical environment an organism occupies.', 1],
    ['Which of these is a decomposer?', ['Fungi', 'Grass', 'Rabbit', 'Hawk'], 'Fungi and many bacteria break down dead material and recycle nutrients.', 2],
    ['Why do we breathe out more carbon dioxide than we breathe in?', ['Respiration produces it as waste', 'The lungs manufacture it', 'It comes from food in the stomach', 'Air contains none of it'], 'Aerobic respiration releases CO₂ as a waste product.', 2]
  ];

  var CHEMISTRY = [
    ['What happens to ice when it gets warm?', ['It melts into water', 'It turns into wood', 'It becomes heavier', 'It disappears forever'], 'Heating a solid gives its particles enough energy to melt.', 1],
    ['Which of these is a liquid?', ['Milk', 'A brick', 'A pencil', 'A coin'], 'Liquids flow and take the shape of their container.', 1],
    ['What do we call water when it turns into a gas?', ['Steam', 'Ice', 'Snow', 'Frost'], 'Boiling water evaporates into steam, a gas.', 1],
    ['Salt in water will...', ['Dissolve', 'Float on top forever', 'Turn into sand', 'Become a gas'], 'Salt dissolves to make a solution.', 1],
    ['Which of these will a magnet attract?', ['A steel paperclip', 'A plastic straw', 'A paper cup', 'A wooden block'], 'Magnets attract iron and steel, not plastic or wood.', 1],
    ['Which material lets light pass through it?', ['Glass', 'Wood', 'Metal', 'Cardboard'], 'Glass is transparent, so light passes through.', 1],
    ['The three states of matter are...', ['Solid, liquid and gas', 'Hot, warm and cold', 'Big, medium and small', 'Wet, dry and damp'], 'Everyday matter is solid, liquid or gas.', 1],
    ['What is water made of?', ['Hydrogen and oxygen', 'Salt and sand', 'Iron and carbon', 'Only oxygen'], 'A water molecule is H₂O: two hydrogen atoms and one oxygen atom.', 1],
    ['What is the chemical formula for water?', ['H₂O', 'CO₂', 'O₂', 'H₂O₂'], 'Two hydrogen atoms bonded to one oxygen atom.', 1],
    ['Which particle in an atom carries a negative charge?', ['Electron', 'Proton', 'Neutron', 'Nucleus'], 'Electrons orbit the nucleus and carry a −1 charge.', 2],
    ['The atomic number of an element tells you the number of...', ['Protons', 'Neutrons', 'Electron shells', 'Isotopes'], 'The atomic number is the proton count, which defines the element.', 3],
    ['What is a compound?', ['Two or more elements chemically bonded together', 'Two elements mixed but not bonded', 'A single type of atom', 'Any liquid'], 'A mixture can be separated physically; a compound cannot.', 2],
    ['A pH of 3 means a substance is...', ['Acidic', 'Alkaline', 'Neutral', 'A gas'], 'Below 7 is acidic, 7 is neutral, above 7 is alkaline.', 2],
    ['What happens to particles when a solid melts?', ['They gain energy and move past each other', 'They stop moving', 'They lose mass', 'They break into atoms'], 'Melting gives particles enough energy to escape fixed positions.', 2],
    ['Which gas makes up about 78% of the air?', ['Nitrogen', 'Oxygen', 'Carbon dioxide', 'Argon'], 'Air is roughly 78% nitrogen and 21% oxygen.', 2],
    ['What is the name of the reaction between an acid and a base?', ['Neutralisation', 'Combustion', 'Oxidation', 'Electrolysis'], 'Acid + base → salt + water.', 3],
    ['In a chemical reaction, mass is...', ['Conserved', 'Always lost', 'Always gained', 'Converted into heat'], 'Atoms are rearranged, never created or destroyed.', 3],
    ['Which method separates a dissolved solid from its solvent?', ['Evaporation', 'Filtration', 'Decanting', 'Sieving'], 'Filtration only removes undissolved solids.', 2],
    ['What does a catalyst do?', ['Speeds up a reaction without being used up', 'Slows a reaction permanently', 'Turns solids into gases', 'Adds mass to the products'], 'It provides an alternative route with lower activation energy.', 3],
    ['The rows of the periodic table are called...', ['Periods', 'Groups', 'Families', 'Series'], 'Vertical columns are groups; horizontal rows are periods.', 3],
    ['Elements in the same group of the periodic table have...', ['Similar chemical properties', 'The same mass', 'The same number of neutrons', 'The same colour'], 'They share the same number of outer-shell electrons.', 3],
    ['What is combustion?', ['A reaction with oxygen that releases energy', 'A reaction that absorbs light', 'Freezing of a liquid', 'The splitting of an atom'], 'Burning fuel in oxygen produces heat, and usually CO₂ and water.', 2],
    ['Which of these is a physical change?', ['Ice melting', 'Wood burning', 'Iron rusting', 'Baking a cake'], 'A physical change is reversible and forms no new substance.', 1],
    ['What is an isotope?', ['An atom with the same protons but a different number of neutrons', 'A charged atom', 'A different element', 'A type of molecule'], 'Isotopes share chemistry but differ in mass.', 3],
    ['NaCl is the formula for...', ['Table salt', 'Baking soda', 'Sugar', 'Chalk'], 'Sodium chloride, an ionic compound.', 1],
    ['An ion is an atom that has...', ['Gained or lost electrons', 'Gained protons', 'Lost its nucleus', 'Been heated'], 'Losing electrons gives a positive ion; gaining them gives a negative ion.', 3],
    ['Which state of matter has a fixed volume but no fixed shape?', ['Liquid', 'Solid', 'Gas', 'Plasma'], 'Liquids take the shape of their container but keep their volume.', 1],
    ['Rusting requires iron plus...', ['Oxygen and water', 'Nitrogen and heat', 'Carbon and salt', 'Light alone'], 'Rust is hydrated iron(III) oxide.', 2]
  ];

  var PHYSICS = [
    ['What makes a ball fall back down when you throw it up?', ['Gravity', 'Wind', 'Sound', 'Light'], 'Gravity pulls objects towards the Earth.', 1],
    ['Which of these makes a sound?', ['A vibrating guitar string', 'A still rock', 'A drawing', 'A shadow'], 'Sound is made by something vibrating.', 1],
    ['A shadow forms when...', ['An object blocks light', 'The Sun goes out', 'Air moves', 'Water freezes'], 'Light travels in straight lines and cannot pass through solid objects.', 1],
    ['Which surface makes it hardest to slide a box?', ['Rough carpet', 'Smooth ice', 'Polished wood', 'Wet glass'], 'Rough surfaces create more friction.', 1],
    ['What do we use a battery for?', ['To supply electrical energy', 'To make things colder', 'To create gravity', 'To block sound'], 'A battery pushes charge around a circuit.', 1],
    ['Which of these floats in water?', ['A cork', 'A stone', 'A metal spoon', 'A brick'], 'Objects less dense than water float.', 1],
    ['A push or a pull is called a...', ['Force', 'Mass', 'Colour', 'Sound'], 'Forces can change an object\'s speed, direction or shape.', 1],
    ['What happens to a bulb when you break the circuit?', ['It goes out', 'It shines brighter', 'It changes colour', 'Nothing changes'], 'Current needs a complete loop to flow.', 1],
    ['What is the SI unit of force?', ['Newton', 'Joule', 'Watt', 'Pascal'], 'One newton accelerates 1 kg by 1 m/s².', 2],
    ['Speed is calculated as...', ['Distance ÷ time', 'Time ÷ distance', 'Distance × time', 'Force ÷ mass'], 'Speed = distance travelled per unit time.', 2],
    ['Which force pulls objects towards the Earth?', ['Gravity', 'Friction', 'Magnetism', 'Upthrust'], 'Gravity acts between any two masses.', 1],
    ['What does an object\'s acceleration depend on?', ['The resultant force and its mass', 'Its colour', 'Its volume only', 'Its temperature'], 'a = F ÷ m, from Newton\'s second law.', 3],
    ['Energy can be...', ['Transferred but not created or destroyed', 'Created by machines', 'Destroyed by friction', 'Made from nothing'], 'This is the law of conservation of energy.', 2],
    ['A ball held above the ground has which store of energy?', ['Gravitational potential', 'Kinetic', 'Thermal', 'Nuclear'], 'Raising an object stores energy in the gravity field.', 2],
    ['Which of these is a good conductor of electricity?', ['Copper', 'Rubber', 'Glass', 'Dry wood'], 'Metals have free electrons that carry charge.', 1],
    ['In a series circuit, the current...', ['Is the same everywhere', 'Splits between components', 'Is zero', 'Increases along the loop'], 'There is only one path, so the same current flows through each component.', 3],
    ['What is the unit of electrical resistance?', ['Ohm', 'Volt', 'Amp', 'Coulomb'], 'Resistance in ohms = voltage ÷ current.', 3],
    ['Light travels fastest through...', ['A vacuum', 'Water', 'Glass', 'Diamond'], 'Any medium slows light down; a vacuum does not.', 2],
    ['What happens to a light ray entering glass at an angle?', ['It bends towards the normal', 'It bends away from the normal', 'It stops', 'It reflects completely'], 'Refraction bends light towards the normal in a denser medium.', 3],
    ['Sound cannot travel through...', ['A vacuum', 'Air', 'Water', 'Steel'], 'Sound needs particles to vibrate; a vacuum has none.', 2],
    ['The pitch of a sound depends on its...', ['Frequency', 'Amplitude', 'Speed', 'Volume'], 'Higher frequency means higher pitch; amplitude sets loudness.', 2],
    ['Friction between surfaces usually produces...', ['Heat', 'Light only', 'Electricity', 'Sound only'], 'Work done against friction is transferred to thermal energy.', 1],
    ['Weight is best described as...', ['The force of gravity on a mass', 'The amount of matter in an object', 'The same everywhere in the universe', 'Measured in kilograms'], 'Mass is measured in kg; weight is a force in newtons.', 3],
    ['Which of these is a renewable energy source?', ['Wind', 'Coal', 'Natural gas', 'Crude oil'], 'Wind is replenished continuously; fossil fuels are not.', 1],
    ['Power is...', ['Energy transferred per second', 'Force times distance', 'Mass times speed', 'Voltage times resistance'], 'Power in watts = joules per second.', 3],
    ['A magnet\'s field is strongest at its...', ['Poles', 'Centre', 'Surface only', 'North side only'], 'Field lines are most concentrated at the poles.', 1],
    ['What keeps a satellite in orbit?', ['Gravity acting as a centripetal force', 'Its engines firing constantly', 'Air pressure', 'Magnetism'], 'Gravity continually pulls the satellite towards Earth, curving its path.', 3],
    ['If you double the speed of a moving object, its kinetic energy...', ['Quadruples', 'Doubles', 'Halves', 'Stays the same'], 'KE = ½mv², so energy scales with the square of speed.', 3]
  ];

  var EARTH = [
    ['Radiometric dating works by measuring...', ['The decay of unstable isotopes in rock', 'The thickness of the soil above', 'The height of nearby mountains', 'The salinity of the ocean'], 'Known half-lives turn isotope ratios into an age.', 3],
    ['The Moon always shows Earth the same face because...', ['Its rotation and its orbit take the same time', 'It does not rotate at all', 'Earth blocks the far side', 'It is too distant to see turning'], 'This is called tidal locking.', 3],
    ['Sea-floor spreading is strong evidence for...', ['Plate tectonics', 'A shrinking Earth', 'A completely fixed crust', 'A young Earth'], 'Magnetic stripes either side of mid-ocean ridges record the spreading.', 3],
    ['Which object gives the Earth its light and heat?', ['The Sun', 'The Moon', 'A star called Sirius', 'A comet'], 'The Sun is our nearest star.', 1],
    ['How many days are there in a week?', ['7', '5', '10', '12'], 'A week has seven days.', 1],
    ['What falls from clouds as rain?', ['Water', 'Sand', 'Rocks', 'Air'], 'Clouds hold tiny water droplets that join and fall as rain.', 1],
    ['Which season usually comes after winter?', ['Spring', 'Autumn', 'Summer', 'Winter again'], 'The order is winter, spring, summer, autumn.', 1],
    ['What do we call the Earth\'s natural satellite?', ['The Moon', 'Mars', 'The Sun', 'Venus'], 'The Moon orbits the Earth about once a month.', 1],
    ['Which of these is a source of water?', ['A river', 'A pavement', 'A brick wall', 'A lamp'], 'Rivers, lakes, seas and rain are sources of water.', 1],
    ['Day and night happen because...', ['The Earth spins', 'The Sun switches off', 'Clouds cover the Sun', 'The Moon blocks light'], 'The Earth turns once every 24 hours.', 1],
    ['What is soil mostly made of?', ['Tiny bits of rock and dead plant material', 'Pure water', 'Plastic', 'Metal'], 'Soil forms as rock breaks down and organic matter builds up.', 1],
    ['Which layer of the Earth do we live on?', ['The crust', 'The mantle', 'The outer core', 'The inner core'], 'The crust is a thin, rigid outer shell.', 1],
    ['Earthquakes are mostly caused by...', ['Movement at tectonic plate boundaries', 'Ocean waves', 'The Moon\'s heat', 'Falling meteorites'], 'Stress builds along faults and is released suddenly.', 2],
    ['Which rock type forms from cooled magma?', ['Igneous', 'Sedimentary', 'Metamorphic', 'Organic'], 'Igneous rocks crystallise from molten rock.', 2],
    ['What drives the water cycle?', ['Energy from the Sun', 'The Earth\'s core', 'Volcanoes', 'Tides'], 'Solar energy evaporates water, which later condenses and falls as rain.', 2],
    ['Which planet is closest to the Sun?', ['Mercury', 'Venus', 'Earth', 'Mars'], 'Mercury orbits at about 58 million km.', 1],
    ['Why do we have seasons?', ['The Earth\'s axis is tilted', 'The Earth moves closer to the Sun in summer', 'The Sun changes brightness', 'The Moon blocks sunlight'], 'The 23.5° tilt changes how directly sunlight strikes each hemisphere.', 2],
    ['How long does light from the Sun take to reach Earth?', ['About 8 minutes', 'About 8 seconds', 'About 8 hours', 'Instantly'], 'Light covers 150 million km in roughly 500 seconds.', 3],
    ['What causes tides on Earth?', ['The gravitational pull of the Moon and Sun', 'Wind alone', 'The Earth\'s magnetic field', 'Underwater volcanoes'], 'The Moon\'s pull dominates; the Sun adds to it at spring tides.', 2],
    ['Which gas in the atmosphere protects us from ultraviolet radiation?', ['Ozone', 'Nitrogen', 'Helium', 'Hydrogen'], 'Ozone (O₃) in the stratosphere absorbs most UV-B.', 3],
    ['Fossils are most often found in which rock?', ['Sedimentary', 'Igneous', 'Metamorphic', 'Volcanic glass'], 'Sediment buries remains gently, preserving them in layers.', 2],
    ['A galaxy is...', ['A vast collection of stars, gas and dust', 'A single large star', 'A group of planets', 'A type of comet'], 'The Milky Way contains a few hundred billion stars.', 2],
    ['What is the Moon\'s phase called when it is fully lit?', ['Full moon', 'New moon', 'Crescent', 'Eclipse'], 'The whole sunlit side faces Earth at full moon.', 1],
    ['Which of these greenhouse gases is released mainly by burning fossil fuels?', ['Carbon dioxide', 'Neon', 'Argon', 'Krypton'], 'Combustion of carbon-based fuels releases CO₂.', 2],
    ['Weather differs from climate because weather is...', ['Short-term conditions', 'A 30-year average', 'Only about temperature', 'The same everywhere'], 'Climate is the long-term pattern of weather.', 3],
    ['What is the largest planet in the Solar System?', ['Jupiter', 'Saturn', 'Neptune', 'Earth'], 'Jupiter is more than 300 times Earth\'s mass.', 1],
    ['Volcanoes most commonly form...', ['Near tectonic plate boundaries', 'In the middle of flat plains', 'Only under ice', 'Where rivers meet'], 'Magma rises where plates diverge or one subducts beneath another.', 2],
    ['Which process breaks rock down in place, without moving it?', ['Weathering', 'Erosion', 'Deposition', 'Subduction'], 'Erosion transports material; weathering breaks it down where it sits.', 3],
    ['A star like the Sun produces energy by...', ['Nuclear fusion of hydrogen into helium', 'Burning coal', 'Nuclear fission of uranium', 'Chemical reactions'], 'Fusion in the core converts mass into energy.', 3],
    ['Roughly what percentage of the Earth\'s surface is ocean?', ['About 71%', 'About 30%', 'About 50%', 'About 90%'], 'Oceans cover roughly 71% of the surface.', 1],
    ['Which instrument measures air pressure?', ['Barometer', 'Thermometer', 'Anemometer', 'Hygrometer'], 'An anemometer measures wind speed; a hygrometer measures humidity.', 3]
  ];

  var METHOD = [
    ['What is a prediction?', ['A sensible statement of what you think will happen', 'The final result', 'A measurement you took', 'A drawing of the equipment'], 'You make it before the experiment, so the experiment can test it.', 1],
    ['Why do scientists wear goggles in a practical?', ['To protect their eyes', 'To see small things better', 'To look the part', 'To measure light levels'], 'Safety equipment is part of planning any experiment.', 1],
    ['What is a double-blind trial?', ['Neither the participants nor the researchers know who received the treatment', 'Nobody writes down the results', 'Only one group is tested', 'The experiment is run twice'], 'It removes expectation effects from both sides at once.', 3],
    ['A confounding variable is one that...', ['Changes along with what you are testing, muddling the result', 'Is deliberately held constant', 'Has no effect on anything', 'Is measured twice for accuracy'], 'Randomisation is the usual defence against confounders.', 3],
    ['Before you start an experiment you should...', ['Predict what you think will happen', 'Write the conclusion first', 'Change every variable', 'Throw away the equipment'], 'A prediction gives you something to test.', 1],
    ['Which tool would you use to measure temperature?', ['A thermometer', 'A ruler', 'A stopwatch', 'A balance'], 'Thermometers measure how hot or cold something is.', 1],
    ['If you measure something three times, you should...', ['Compare the results and look for odd ones', 'Only keep the biggest', 'Only keep the smallest', 'Ignore them all'], 'Repeats help you spot mistakes.', 1],
    ['Recording your results carefully is important because...', ['Others need to check and repeat your work', 'It makes the page look nice', 'It is faster than thinking', 'It changes the answer'], 'Science depends on results other people can check.', 1],
    ['A hypothesis is best described as...', ['A testable prediction', 'A proven fact', 'A random guess', 'The final conclusion'], 'A hypothesis must be capable of being shown wrong.', 2],
    ['In an experiment, the variable you deliberately change is the...', ['Independent variable', 'Dependent variable', 'Control variable', 'Constant'], 'You change the independent variable and measure the dependent one.', 2],
    ['Why do scientists use a control group?', ['To compare against the group receiving the treatment', 'To increase the sample size', 'To speed up the experiment', 'To avoid measuring anything'], 'The control shows what happens without the change being tested.', 2],
    ['Repeating an experiment several times mainly improves...', ['Reliability', 'The hypothesis', 'The units used', 'The equipment cost'], 'Repeats reveal random error and let you spot anomalies.', 2],
    ['A result that does not fit the pattern of the others is called...', ['An anomaly', 'A control', 'A constant', 'A conclusion'], 'Anomalies should be investigated, not silently deleted.', 3],
    ['Which of these makes a conclusion stronger?', ['Independent replication by other researchers', 'A larger font in the report', 'A famous author', 'A confident tone'], 'Reproducibility is the core test of a scientific claim.', 3],
    ['Accuracy means how close a measurement is to...', ['The true value', 'Other measurements', 'The mean of your results', 'Zero'], 'Precision is about consistency; accuracy is about correctness.', 3],
    ['If two things rise together, you can conclude...', ['They are correlated, which does not prove cause', 'One definitely causes the other', 'Both are false', 'Nothing can ever be learned'], 'Correlation may come from a third factor or coincidence.', 3],
    ['A fair test requires that...', ['Only one variable changes at a time', 'Every variable changes', 'No measurements are taken', 'The result is known in advance'], 'Otherwise you cannot tell which change caused the effect.', 1],
    ['Peer review is the process of...', ['Other experts checking work before publication', 'The public voting on results', 'Repeating an experiment yourself', 'Writing a summary'], 'Reviewers check method, analysis and reasoning.', 3],
    ['Which graph best shows how one measurement changes over time?', ['A line graph', 'A pie chart', 'A Venn diagram', 'A photograph'], 'Line graphs show continuous change against a continuous variable.', 1],
    ['What should you do with an unexpected result?', ['Investigate and repeat the measurement', 'Delete it quietly', 'Change the hypothesis to fit it without checking', 'Ignore the whole experiment'], 'Unexpected results are often where new understanding starts.', 1],
    ['A theory in science is...', ['A well-tested explanation supported by evidence', 'A wild guess', 'The same as a hypothesis', 'An opinion'], 'Everyday "theory" means guess; scientific theory means the opposite.', 3],
    ['Which is the most precise measurement of length?', ['12.45 cm', '12 cm', 'about 12 cm', 'over 10 cm'], 'More significant figures means a finer resolution.', 2],
    ['Bias in an experiment means...', ['Something systematically pushes results in one direction', 'The results are random', 'The sample is too large', 'The units are wrong'], 'Blinding and randomisation help reduce bias.', 3]
  ];

  function bank(items, kicker) {
    return function (n, stage) {
      return U.sample(U.forStage(items, stage), n).map(function (it) {
        var correct = it[1][0];
        var options = U.shuffle(it[1]);
        return {
          type: 'choice',
          kicker: kicker,
          prompt: it[0],
          choices: options,
          answer: options.indexOf(correct),
          explanation: it[2]
        };
      });
    };
  }

  function mixed(n, stage) {
    var all = BIOLOGY.concat(CHEMISTRY, PHYSICS, EARTH, METHOD);
    return bank(all, 'mixed review')(n, stage);
  }

  SH.register({
    id: 'science',
    name: 'Science',
    native: '',
    emoji: '🔬',
    color: 'var(--science)',
    blurb: 'Life, materials, forces, the planet and how experiments work.',
    topics: [
      { id: 'biology', name: 'Biology', desc: 'Cells, bodies, plants and ecosystems', generate: bank(BIOLOGY, 'biology') },
      { id: 'chemistry', name: 'Chemistry', desc: 'Atoms, reactions, states and the periodic table', generate: bank(CHEMISTRY, 'chemistry') },
      { id: 'physics', name: 'Physics', desc: 'Forces, energy, electricity, light and sound', generate: bank(PHYSICS, 'physics') },
      { id: 'earth', name: 'Earth & Space', desc: 'Rocks, weather, the Solar System and beyond', generate: bank(EARTH, 'earth & space') },
      { id: 'method', name: 'Scientific Method', desc: 'Variables, controls, evidence and reasoning', generate: bank(METHOD, 'method') },
      { id: 'mixed', name: 'Mixed Review', desc: 'Everything above, shuffled together', generate: mixed }
    ]
  });
})(window.StudyHub);
