import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';

const appData = {
  "Recommended Exercises": [
    {
      id: "ex1",
      title: "Yoga for Flexibility",
      info: "Improve posture and relieve tension.",
      image: "https://post.healthline.com/wp-content/uploads/2019/10/1296x728-body2-1296x728.jpg",
      video: "https://www.youtube.com/watch?v=v7AYKMP6rOE"
    },
    {
      id: "ex2",
      title: "Home Full Body Workout",
      info: "No equipment full body burn.",
      image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80",
      video: "https://www.youtube.com/watch?v=UBMk30rjy0o"
    },
    {
      id: "ex3",
      title: "Morning Stretch Routine",
      info: "Start your day energized.",
      image: "https://st3.depositphotos.com/1003326/15173/i/450/depositphotos_151739432-stock-photo-woman-enjoying-sunny-morning.jpg",
      video: "https://www.youtube.com/watch?v=qULTwquOuT4"
    },
     {
    "id": "ex4",
    "title": "10-Minute HIIT Blast",
    "info": "Burn fat quickly with this intense session.",
    "image": "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg",
    "video": "https://www.youtube.com/watch?v=ml6cT4AZdqI"
  },
  {
    "id": "ex5",
    "title": "Beginner Strength Training",
    "info": "Build muscle with beginner moves.",
    "image": "https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg",
    "video": "https://www.youtube.com/watch?v=U0bhE67HuDY"
  },
  {
    "id": "ex6",
    "title": "Pilates Core Focus",
    "info": "Strengthen your core and improve balance.",
    "image": "https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg",
    "video": "https://www.youtube.com/watch?v=lCg_gh_fppI"
  },
  {
    "id": "ex7",
    "title": "Evening Relaxation Yoga",
    "info": "Wind down before bed.",
    "image": "https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg",
    "video": "https://www.youtube.com/watch?v=ZToicYcHIOU"
  },
  {
    "id": "ex8",
    "title": "Desk Stretches",
    "info": "Perfect for remote workers.",
    "image": "https://images.pexels.com/photos/414029/pexels-photo-414029.jpeg",
    "video": "https://www.youtube.com/watch?v=K-CrEi0ymMg"
  },{
  "id": "ex9",
  "title": "Cardio Dance Workout",
  "info": "Fun and energetic way to burn calories.",
  "image": "https://images.pexels.com/photos/1552248/pexels-photo-1552248.jpeg",
  "video": "https://www.youtube.com/watch?v=ZWk19OVon2k"
},
{
  "id": "ex10",
  "title": "Quick Ab Circuit",
  "info": "Blast your abs in just 5 minutes.",
  "image": "https://images.pexels.com/photos/4324024/pexels-photo-4324024.jpeg",
  "video": "https://www.youtube.com/watch?v=1919eTCoESo"
}

  ],
  "Home Remedies": [
    {
      id: "rem1",
      title: "Ginger Tea for Colds",
      info: "Natural remedy for cold and sore throat.",
      image: "https://tse2.mm.bing.net/th?id=OIP.c8jxqsXQtplAv_fOz1lAlQHaFj&pid=Api&P=0&h=180",
      video: "https://youtu.be/nASg3fVe60c?si=i_83znJ9igjTx6uZ"
    },
    {
      id: "rem2",
      title: "Honey Lemon Drink",
      info: "Boost immunity and detox.",
      image: "https://i.pinimg.com/736x/fe/ba/a0/febaa0b62af27067ffc0cc8f227a5c8f.jpg",
      video: "https://youtu.be/-u4ReGgCgDM?si=sUYGAK2JLsxzvpgM"
    },
    {
      id: "rem3",
      title: "Steam Inhalation",
      info: "Clear sinuses and congestion.",
      image: "https://drgreenmom.com/wp-content/uploads/2022/06/blog-pic-7.png",
      video: "https://youtube.com/shorts/6vVxMPyEueE?si=buuQXFIPjpXqDHYa"
    },{
  "id": "rem4",
  "title": "Turmeric Milk",
  "info": "Great for healing and anti-inflammation.",
  "image": "https://nadiashealthykitchen.com/wp-content/uploads/2017/07/golden-turmeric-milk_7.jpg",
  "video": "https://youtu.be/6p3OmXofxQM?si=oPXQUMRoBA2e8hE8"
},
{
  "id": "rem5",
  "title": "Salt Water Gargle",
  "info": "Relieves sore throat and kills bacteria.",
  "image": "https://th.bing.com/th/id/OIP.H-3EwiVtfh3nCtuVajEQaQHaE8?rs=1&pid=ImgDetMain",
  "video": "https://youtu.be/IEwh7-H4yj8?si=fjsbvtBBhl1Sl45I"
},
{
  "id": "rem6",
  "title": "Aloe Vera Gel",
  "info": "Soothes skin irritation and burns.",
  "image": "https://plantedwithkatie.com/wp-content/uploads/2023/10/14-1-683x1024.jpg",
  "video": "https://youtube.com/shorts/c1T1MaudesE?si=QK4FJJg5JHiEnq9a"
}
  ,
  {
    id: "rem7",
    title: "Clove Oil for Toothache",
    info: "Provides instant relief from tooth pain.",
    image: "https://mytikachi.com/wp-content/uploads/2022/04/clove-oil-clove-essense-1024x952.jpg",
    video: "https://youtu.be/K9MqS4dDZTU?si=Z5MTgoSbtcQG-PCf"
  },
  {
    id: "rem8",
    title: "Peppermint Tea for Digestion",
    info: "Helps relieve bloating and indigestion.",
    image: "https://www.shape.com/thmb/w7DoIb88dmov1u2Po6HkReyfosQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Benefits-of-Peppermint-Tea-GettyImages-1418206475-a1f2c5074f2842fb8f56b4a59afe67cc.jpg",
    video: "https://youtu.be/r4nP-L2aVm4?si=UZBDlYS5MvHEAsl5"
  },
  {
    id: "rem9",
    title: "Coconut Oil for Dry Skin",
    info: "Deeply hydrates and nourishes skin.",
    image: "https://th.bing.com/th/id/OIP.6TKDrTQ-ZOt2wutbMCdrDAHaE-?rs=1&pid=ImgDetMain",
    video: "https://youtu.be/M2_mDpd5F1A?si=SgYs790bgFGDfQss"
  },
  {
    id: "rem10",
    title: "Basil Leaves for Cough",
    info: "Reduces cough and supports respiratory health.",
    image: "https://www.photos-public-domain.com/wp-content/uploads/2011/07/sweet-basil-plant.jpg",
    video: "https://youtube.com/shorts/0BjJg2o9yhM?si=dOmlGl0cvkElKmm-"
  }

  ],
  "Health Tips": [
    {
      id: "tip1",
      title: "Stay Hydrated",
      info: "Drink 2-3 liters of water daily.",
      image: "https://article.images.consumerreports.org/f_auto/prod/content/dam/CRO%20Images%202019/Health/06June/CR-Health-Inlinehero-stay-hydrated-0619.jpg",
      video: "https://youtu.be/F5IuQ3k1ohI?si=mRkk5eUOo1A1nWNK"
    },
    {
      id: "tip2",
      title: "Sleep Well",
      info: "Aim for 7–9 hours of sleep.",
      image: "https://tse3.mm.bing.net/th?id=OIP.XG5EhrQ1csLUhCDysnnMqQHaHa&pid=Api&P=0&h=180",
      video: "https://youtu.be/tmefMWAdAJw?si=euuW9rPhaWOktYhU"
    },
    {
      id: "tip3",
      title: "Eat More Greens",
      info: "Add leafy vegetables to meals.",
      image: "https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&w=800&q=80",
      video: "https://youtu.be/UQeSJCm2bVo?si=-XsP_Qx2Pn4w0JF6"
    },{
    id: "tip4",
    title: "Exercise Daily",
    info: "30 mins of moderate exercise boosts health.",
    image: "https://images.healthshots.com/healthshots/en/uploads/2023/05/10200007/exercise.jpg",
    video: "https://youtu.be/wWGulLAa0O0?si=gNRSirzGuHi-WUnx"
  },
  {
    id: "tip5",
    title: "Limit Sugar Intake",
    info: "Cut down on sweets and sugary drinks.",
    image: "https://th.bing.com/th/id/OIP.yCS2c1jvQCUhg-Nd7zQTbgHaE7?rs=1&pid=ImgDetMain",
    video: "https://youtu.be/9BsycmZ28Yg?si=DrRrfOzQmIXzVzG9"
  },
  {
    id: "tip6",
    title: "Practice Meditation",
    info: "Reduce stress and improve focus.",
    image: "https://th.bing.com/th/id/OIP.RIA9FAIb_JZ0Q89dgaHa8AHaD4?rs=1&pid=ImgDetMain",
    video: "https://youtu.be/inpok4MKVLM?si=Vmsq8BhMUlq0-zQg"
  },
  {
    id: "tip7",
    title: "Wash Your Hands",
    info: "Prevent illness by regular handwashing.",
    image: "https://post.healthline.com/wp-content/uploads/2020/05/Close-up-of-woman-washing-her-hands-with-soap-1296x728-header.jpg",
    video: "https://youtu.be/fyNhJanvcJY?si=y8mbOZY1U70k85od"
  },
  {
    id: "tip8",
    title: "Stretch Often",
    info: "Loosen up muscles and improve posture.",
    image: "https://th.bing.com/th/id/OIP.RPlivLg3c2d_9IDf8NXOzQHaE7?rs=1&pid=ImgDetMain",
    video: "https://youtu.be/vc1E5CfRfos?si=Mb9Nbo8qS_WZzKQU"
  },
  {
    id: "tip9",
    title: "Get Sunlight",
    info: "Vitamin D helps boost your immune system.",
    image: "https://images.squarespace-cdn.com/content/v1/59f0e6beace8641044d76e9c/1682942260206-TSK5SDBN1LL2AUJ9HV3L/Social+Sunlight.jpg",
    video: "https://youtu.be/XMH8LLvlRPM?si=_zokZlqoTsq6y_HL"
  },
  {
    id: "tip10",
    title: "Maintain Social Connections",
    info: "Strong relationships support mental well-being.",
    image: "https://www.shapeyourhappiness.com/wp-content/uploads/2019/12/Social-1024x683.jpg",
    video: "https://youtu.be/RijQpsWEdrE?si=hCmTFnpcD1rXsWeU"
  }

  ]
};

const ExerciseScreen = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); 
  const fetchExercises = async () => {
    try {
      const response = await fetch('https://exercisedb.p.rapidapi.com/exercises', {
        headers: {
          'X-RapidAPI-Key': '05b620c2bdmsha4c217ec160d1b5p137fa3jsnb6fb8afa4afa',
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
        },
      });

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        Alert.alert("No Data", "No exercises found.");
        setExercises([]);
      } else {
        setExercises(data.slice(0, 20));
      }
    } catch (error) {
      Alert.alert('Error', 'Could not fetch exercise data.');
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (url) => {
    Linking.openURL(url).catch((err) =>
      Alert.alert("Error", "Could not open video.")
    );
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.gifUrl }} style={styles.image} />
      <Text style={styles.name}>{item.name.toUpperCase()}</Text>
      <Text style={styles.details}>Target: {item.target}</Text>
      <Text style={styles.details}>Equipment: {item.equipment}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={{ marginTop: 10 }}>Loading Exercises...</Text>
      </View>
    );
  }
  
  return (
    <ImageBackground
      source={require('../assets/images/exercise_background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
  <Ionicons name="arrow-back" size={24} color="white" />
</TouchableOpacity>
          <Text style={styles.mainHeading}>Fitness</Text>

          {Object.entries(appData).map(([section, items]) => (
            <View key={section} style={styles.section}>
              <Text style={styles.heading}>{section}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.card}
                    onPress={() => handlePress(item.video)}
                  >
                    <Image source={{ uri: item.image }} style={styles.image} />
                    <View style={styles.cardText}>
                      <Text style={styles.title}>{item.title}</Text>
                      <Text style={styles.info}>{item.info}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))}

          <Text style={styles.heading}>Exercise Suggestions</Text>
          <FlatList
            data={exercises}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>No exercises to show.</Text>}
          />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mainHeading: {
    fontSize: 37,
 fontFamily:'roboto',
 fontWeight:'bold',
marginTop:10,
marginBottom: 15,
textAlign: 'center',
letterSpacing: 1,
color: '#00BFFF',
 textShadowColor: 'rgba(255, 255, 255, 0.2)',
textShadowOffset: { width: 0, height: 1 },
textShadowRadius: 4,



  },
  section: {
    marginBottom: 30,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    color: 'white',
    textShadowColor: 'blue',
    shadowOpacity: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 16,
    padding: 12,
    width: 250,
    elevation: 3,
    shadowColor: 'black',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    marginLeft:10,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  cardText: {
    padding: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004D40',
  },
  info: {
    fontSize: 13,
    color: '#555',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  details: {
    color: '#666',
    fontSize: 13,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    
    paddingBottom: 20,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 10,
    marginTop: 20,
  },
  backText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
  },
});

export default ExerciseScreen;