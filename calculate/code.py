import json
import csv
from pprint import pprint
from scipy.stats.stats import pearsonr
import scipy


json_data=open('')

immi_data = json.load(json_data)
pop_data = json.load(json_data)
unemploy_data = json.load(json_data)
rent_data = json.load(json_data)

pprint(data[""]) 
json_data.close()

# immigration = []
# factor = []
# print pearsonr(immigration, factor)
# print scipy.stats.spearmanr(immigration, factor)



# (0.7168657925031986, 0.019644378469666064) (Pearson's correlation coefficient, 2-tailed p-value)
# (0.80298537814383031, 0.0051573302914765945) Spearman 

# Calculates a Pearson correlation coefficient and the p-value for testing non-correlation.
# The Pearson correlation coefficient measures the linear relationship between two datasets. Strictly speaking, Pearson's correlation requires that each dataset be normally distributed. Like other correlation coefficients, this one varies between -1 and +1 with 0 implying no correlation. Correlations of -1 or +1 imply an exact linear relationship. Positive correlations imply that as x increases, so does y. Negative correlations imply that as x increases, y decreases.

# The p-value roughly indicates the probability of an uncorrelated system producing datasets that have a Pearson correlation at least as extreme as the one computed from these datasets. The p-values are not entirely reliable but are probably reasonable for datasets larger than 500 or so. 

##########################################################################################
# Pearson benchmarks linear relationship, Spearman benchmarks monotonic relationship (few infinities more general case, but for some power tradeoff).

# print "Hello"


# If the significance is not terribly important, you can use numpy.corrcoef()

# scipy.spatial.distance.mahalanobis
# The Mahalanobis distance does take into account the correlation between two arrays, but it provides a distance measure, not a correlation. (Mathematically, the Mahalanobis distance is not a true distance function; nevertheless, it can be used as such in certain contexts to great advantage.)